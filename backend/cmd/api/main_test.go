package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	_ "modernc.org/sqlite"
)

func testApp(t *testing.T) *app {
	t.Helper()
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	old := os.Getenv("CORS_ORIGINS")
	_ = os.Setenv("CORS_ORIGINS", "http://localhost:5173")
	t.Cleanup(func() { _ = os.Setenv("CORS_ORIGINS", old) })
	if err := migrate(db); err != nil {
		t.Fatal(err)
	}
	return newApp(db)
}

func TestTodoOwnershipFlow(t *testing.T) {
	a := testApp(t)
	server := httptest.NewServer(a.handler())
	defer server.Close()
	register := `{"email":"student@example.test","name":"Student","password":"password123"}`
	response, err := http.Post(server.URL+"/api/auth/register", "application/json", strings.NewReader(register))
	if err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != http.StatusCreated {
		t.Fatalf("register status = %d", response.StatusCode)
	}
	var auth struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(response.Body).Decode(&auth); err != nil {
		t.Fatal(err)
	}
	_ = response.Body.Close()
	req, _ := http.NewRequest(http.MethodPost, server.URL+"/api/todos", strings.NewReader(`{"title":"Write tests","priority":2}`))
	req.Header.Set("Authorization", "Bearer "+auth.Token)
	req.Header.Set("Content-Type", "application/json")
	response, err = http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != http.StatusCreated {
		t.Fatalf("create status = %d", response.StatusCode)
	}
	_ = response.Body.Close()
	req, _ = http.NewRequest(http.MethodGet, server.URL+"/api/todos", nil)
	req.Header.Set("Authorization", "Bearer "+auth.Token)
	response, err = http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		t.Fatalf("list status = %d", response.StatusCode)
	}
	var list struct {
		Count int `json:"count"`
	}
	if err := json.NewDecoder(response.Body).Decode(&list); err != nil {
		t.Fatal(err)
	}
	if list.Count != 1 {
		t.Fatalf("todo count = %d", list.Count)
	}
}
