package main

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"
	_ "modernc.org/sqlite"
)

type contextKey string

const userKey contextKey = "user"

type claims struct {
	Subject string `json:"sub"`
	Role    string `json:"role"`
	Exp     int64  `json:"exp"`
}

type app struct {
	db       *sql.DB
	secret   []byte
	ttl      time.Duration
	mockAuth bool
	origins  map[string]bool
	rateMu   sync.Mutex
	rate     map[string]*rateWindow
}

type rateWindow struct {
	started time.Time
	count   int
}

type user struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  string `json:"role"`
}

type todo struct {
	ID          string `json:"id"`
	UserID      string `json:"userId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Completed   bool   `json:"completed"`
	Priority    int    `json:"priority"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

type todoInput struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Completed   bool   `json:"completed"`
	Priority    int    `json:"priority"`
}

func main() {
	databaseURL := env("DATABASE_URL", "./data/siam-u.db")
	if err := os.MkdirAll(filepath.Dir(databaseURL), 0o750); err != nil {
		log.Fatal(err)
	}
	db, err := sql.Open("sqlite", databaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	if err := migrate(db); err != nil {
		log.Fatal(err)
	}
	server := &http.Server{Addr: ":" + env("PORT", "4000"), Handler: newApp(db).handler(), ReadHeaderTimeout: 5 * time.Second}
	log.Printf("Siam U Go API listening on %s", server.Addr)
	log.Fatal(server.ListenAndServe())
}

func newApp(db *sql.DB) *app {
	ttlSeconds, _ := strconv.Atoi(env("JWT_TTL_SECONDS", "3600"))
	if ttlSeconds <= 0 {
		ttlSeconds = 3600
	}
	origins := map[string]bool{}
	for _, origin := range strings.Split(env("CORS_ORIGINS", "http://localhost:5173"), ",") {
		origins[strings.TrimSpace(origin)] = true
	}
	return &app{
		db: db, secret: []byte(env("JWT_SECRET", "local-development-secret-change-me")),
		ttl: time.Duration(ttlSeconds) * time.Second, mockAuth: env("MOCK_OAUTH", "true") != "false",
		origins: origins, rate: map[string]*rateWindow{},
	}
}

func migrate(db *sql.DB) error {
	paths := []string{"db/migrations/001_initial.sql", "../db/migrations/001_initial.sql", "../../db/migrations/001_initial.sql"}
	var schema []byte
	var err error
	for _, path := range paths {
		schema, err = os.ReadFile(path)
		if err == nil {
			break
		}
	}
	if err != nil {
		return fmt.Errorf("read migration: %w", err)
	}
	_, err = db.Exec(string(schema))
	return err
}

func (a *app) handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", a.health)
	mux.HandleFunc("POST /api/auth/register", a.register)
	mux.HandleFunc("POST /api/auth/login", a.login)
	mux.HandleFunc("POST /api/auth/mock", a.mockLogin)
	mux.HandleFunc("POST /api/auth/forgot-password", a.forgotPassword)
	mux.Handle("/api/todos", a.auth(http.HandlerFunc(a.todos)))
	mux.Handle("/api/todos/", a.auth(http.HandlerFunc(a.todoByID)))
	mux.Handle("/api/me", a.auth(http.HandlerFunc(a.me)))
	return a.security(a.rateLimit(a.cors(mux)))
}

func (a *app) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "service": "siam-u-go-backend"})
}

func (a *app) register(w http.ResponseWriter, r *http.Request) {
	var in struct{ Email, Name, Password string }
	if !decodeJSON(w, r, &in) || !validEmail(in.Email) || len(in.Password) < 8 || strings.TrimSpace(in.Name) == "" {
		writeError(w, http.StatusBadRequest, "email, name and password (8+ characters) are required")
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	u := user{ID: newID("usr"), Email: strings.ToLower(strings.TrimSpace(in.Email)), Name: strings.TrimSpace(in.Name), Role: "student"}
	_, err = a.db.Exec(`INSERT INTO users(id,email,name,password_hash,role,created_at) VALUES(?,?,?,?,?,?)`, u.ID, u.Email, u.Name, string(hash), u.Role, now())
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE") {
			writeError(w, http.StatusConflict, "email_already_registered")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	writeJSON(w, http.StatusCreated, a.authResponse(u))
}

func (a *app) login(w http.ResponseWriter, r *http.Request) {
	var in struct{ Email, Password string }
	if !decodeJSON(w, r, &in) {
		return
	}
	var u user
	var hash string
	err := a.db.QueryRow(`SELECT id,email,name,password_hash,role FROM users WHERE email = ?`, strings.ToLower(strings.TrimSpace(in.Email))).Scan(&u.ID, &u.Email, &u.Name, &hash, &u.Role)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(in.Password)) != nil {
		writeError(w, http.StatusUnauthorized, "invalid_credentials")
		return
	}
	writeJSON(w, http.StatusOK, a.authResponse(u))
}

func (a *app) mockLogin(w http.ResponseWriter, r *http.Request) {
	if !a.mockAuth {
		writeError(w, http.StatusNotFound, "not_found")
		return
	}
	var in struct{ Email, Name, Role string }
	if !decodeJSON(w, r, &in) || !validEmail(in.Email) || strings.TrimSpace(in.Name) == "" {
		writeError(w, http.StatusBadRequest, "email and name are required")
		return
	}
	in.Email, in.Name = strings.ToLower(strings.TrimSpace(in.Email)), strings.TrimSpace(in.Name)
	var u user
	err := a.db.QueryRow(`SELECT id,email,name,role FROM users WHERE email = ?`, in.Email).Scan(&u.ID, &u.Email, &u.Name, &u.Role)
	if errors.Is(err, sql.ErrNoRows) {
		u = user{ID: newID("usr"), Email: in.Email, Name: in.Name, Role: normalizedRole(in.Role)}
		_, err = a.db.Exec(`INSERT INTO users(id,email,name,role,created_at) VALUES(?,?,?,?,?)`, u.ID, u.Email, u.Name, u.Role, now())
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	writeJSON(w, http.StatusCreated, a.authResponse(u))
}

func (a *app) forgotPassword(w http.ResponseWriter, r *http.Request) {
	var in struct{ Email string }
	if !decodeJSON(w, r, &in) || !validEmail(in.Email) {
		writeError(w, http.StatusBadRequest, "valid email is required")
		return
	}
	writeJSON(w, http.StatusAccepted, map[string]string{"message": "if the account exists, reset instructions will be sent"})
}

func (a *app) me(w http.ResponseWriter, r *http.Request) {
	u, ok := currentUser(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "authentication_required")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"user": u})
}

func (a *app) todos(w http.ResponseWriter, r *http.Request) {
	u, _ := currentUser(r.Context())
	switch r.Method {
	case http.MethodGet:
		q, status := strings.TrimSpace(r.URL.Query().Get("q")), r.URL.Query().Get("status")
		query := `SELECT id,user_id,title,description,completed,priority,created_at,updated_at FROM todos WHERE user_id = ?`
		args := []any{u.ID}
		if q != "" {
			query += ` AND title LIKE ?`
			args = append(args, "%"+q+"%")
		}
		if status == "completed" || status == "pending" {
			query += ` AND completed = ?`
			if status == "completed" {
				args = append(args, 1)
			} else {
				args = append(args, 0)
			}
		}
		query += ` ORDER BY priority DESC, updated_at DESC`
		rows, err := a.db.Query(query, args...)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error")
			return
		}
		defer rows.Close()
		items := []todo{}
		for rows.Next() {
			var t todo
			var completed int
			if err := rows.Scan(&t.ID, &t.UserID, &t.Title, &t.Description, &completed, &t.Priority, &t.CreatedAt, &t.UpdatedAt); err != nil {
				writeError(w, 500, "internal_error")
				return
			}
			t.Completed = completed == 1
			items = append(items, t)
		}
		writeJSON(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
	case http.MethodPost:
		var in todoInput
		if !decodeJSON(w, r, &in) {
			return
		}
		in.Title = strings.TrimSpace(in.Title)
		if in.Title == "" || len(in.Title) > 240 || in.Priority < 0 || in.Priority > 3 {
			writeError(w, 400, "invalid todo")
			return
		}
		t := todo{ID: newID("todo"), UserID: u.ID, Title: in.Title, Description: in.Description, Completed: in.Completed, Priority: in.Priority, CreatedAt: now(), UpdatedAt: now()}
		_, err := a.db.Exec(`INSERT INTO todos(id,user_id,title,description,completed,priority,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)`, t.ID, t.UserID, t.Title, t.Description, boolInt(t.Completed), t.Priority, t.CreatedAt, t.UpdatedAt)
		if err != nil {
			writeError(w, 500, "internal_error")
			return
		}
		writeJSON(w, http.StatusCreated, t)
	default:
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed")
	}
}

func (a *app) todoByID(w http.ResponseWriter, r *http.Request) {
	u, _ := currentUser(r.Context())
	id := strings.TrimPrefix(r.URL.Path, "/api/todos/")
	if id == "" {
		writeError(w, http.StatusNotFound, "not_found")
		return
	}
	if r.Method == http.MethodDelete {
		result, err := a.db.Exec(`DELETE FROM todos WHERE id = ? AND user_id = ?`, id, u.ID)
		if err != nil {
			writeError(w, 500, "internal_error")
			return
		}
		n, _ := result.RowsAffected()
		if n == 0 {
			writeError(w, 404, "not_found")
			return
		}
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method == http.MethodGet {
		t, err := a.findTodo(id, u.ID)
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, 404, "not_found")
			return
		}
		if err != nil {
			writeError(w, 500, "internal_error")
			return
		}
		writeJSON(w, 200, t)
		return
	}
	if r.Method != http.MethodPut {
		writeError(w, 405, "method_not_allowed")
		return
	}
	var in todoInput
	if !decodeJSON(w, r, &in) {
		return
	}
	in.Title = strings.TrimSpace(in.Title)
	if in.Title == "" || len(in.Title) > 240 || in.Priority < 0 || in.Priority > 3 {
		writeError(w, 400, "invalid todo")
		return
	}
	result, err := a.db.Exec(`UPDATE todos SET title=?,description=?,completed=?,priority=?,updated_at=? WHERE id=? AND user_id=?`, in.Title, in.Description, boolInt(in.Completed), in.Priority, now(), id, u.ID)
	if err != nil {
		writeError(w, 500, "internal_error")
		return
	}
	n, _ := result.RowsAffected()
	if n == 0 {
		writeError(w, 404, "not_found")
		return
	}
	t, err := a.findTodo(id, u.ID)
	if err != nil {
		writeError(w, 500, "internal_error")
		return
	}
	writeJSON(w, 200, t)
}

func (a *app) findTodo(id, userID string) (todo, error) {
	var t todo
	var completed int
	err := a.db.QueryRow(`SELECT id,user_id,title,description,completed,priority,created_at,updated_at FROM todos WHERE id=? AND user_id=?`, id, userID).Scan(&t.ID, &t.UserID, &t.Title, &t.Description, &completed, &t.Priority, &t.CreatedAt, &t.UpdatedAt)
	t.Completed = completed == 1
	return t, err
}

func (a *app) auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		c, err := a.verify(raw)
		if err != nil {
			writeError(w, 401, "authentication_required")
			return
		}
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), userKey, user{ID: c.Subject, Role: c.Role})))
	})
}

func (a *app) verify(token string) (claims, error) {
	var c claims
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return c, errors.New("invalid token")
	}
	mac := hmac.New(sha256.New, a.secret)
	_, _ = mac.Write([]byte(parts[0] + "." + parts[1]))
	expected := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	if subtle.ConstantTimeCompare([]byte(expected), []byte(parts[2])) != 1 {
		return c, errors.New("invalid token")
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil || json.Unmarshal(payload, &c) != nil || c.Exp < time.Now().Unix() {
		return c, errors.New("expired token")
	}
	return c, nil
}

func (a *app) token(u user) string {
	header := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"HS256","typ":"JWT"}`))
	payload, _ := json.Marshal(claims{Subject: u.ID, Role: u.Role, Exp: time.Now().Add(a.ttl).Unix()})
	body := base64.RawURLEncoding.EncodeToString(payload)
	mac := hmac.New(sha256.New, a.secret)
	_, _ = mac.Write([]byte(header + "." + body))
	return header + "." + body + "." + base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func (a *app) authResponse(u user) map[string]any {
	return map[string]any{"user": u, "token": a.token(u)}
}

func (a *app) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origin != "" && a.origins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *app) security(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		next.ServeHTTP(w, r)
	})
}

func (a *app) rateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := strings.Split(r.RemoteAddr, ":")[0]
		a.rateMu.Lock()
		b := a.rate[ip]
		if b == nil || time.Since(b.started) > time.Minute {
			a.rate[ip] = &rateWindow{started: time.Now(), count: 1}
		} else {
			b.count++
			if b.count > 120 {
				a.rateMu.Unlock()
				writeError(w, 429, "rate_limit_exceeded")
				return
			}
		}
		a.rateMu.Unlock()
		next.ServeHTTP(w, r)
	})
}

func currentUser(ctx context.Context) (user, bool) { u, ok := ctx.Value(userKey).(user); return u, ok }
func decodeJSON(w http.ResponseWriter, r *http.Request, target any) bool {
	defer r.Body.Close()
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil || json.Unmarshal(body, target) != nil {
		writeError(w, 400, "invalid_json")
		return false
	}
	return true
}
func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
func validEmail(value string) bool { return strings.Contains(value, "@") && len(value) <= 254 }
func normalizedRole(value string) string {
	if value == "admin" {
		return "admin"
	}
	return "student"
}
func boolInt(value bool) int {
	if value {
		return 1
	}
	return 0
}
func now() string { return time.Now().UTC().Format(time.RFC3339Nano) }
func newID(prefix string) string {
	raw := make([]byte, 12)
	if _, err := rand.Read(raw); err != nil {
		raw = []byte(strconv.FormatInt(time.Now().UnixNano(), 10))
	}
	return prefix + "_" + hex.EncodeToString(raw)
}
