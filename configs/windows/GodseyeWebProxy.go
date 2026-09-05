// Loopback gateway behind Tailscale Serve. Sunshine owns the root because its
// UI uses absolute paths. /t3 is an entry link to T3's separate HTTPS origin.
package main

import (
	"crypto/tls"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"
)

const t3Origin = "https://godseye.tail3123d8.ts.net:8443"

func main() {
	target, err := url.Parse("https://127.0.0.1:47990")
	if err != nil {
		log.Fatal(err)
	}
	proxy := httputil.NewSingleHostReverseProxy(target)
	proxy.Transport = &http.Transport{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true, // Only the loopback Sunshine self-signed certificate.
		},
		ForceAttemptHTTP2: false,
	}
	originalDirector := proxy.Director
	proxy.Director = func(request *http.Request) {
		originalDirector(request)
		request.Host = target.Host
	}
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("Sunshine upstream error: %v", err)
		http.Error(w, "Sunshine is temporarily unavailable. Try again shortly.", http.StatusBadGateway)
	}
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		lower := strings.ToLower(path)
		if lower == "/t3" || strings.HasPrefix(lower, "/t3/") {
			if !strings.HasPrefix(path, "/t3") {
				u := *r.URL
				u.Path = "/t3" + path[3:]
				u.RawPath = ""
				http.Redirect(w, r, u.String(), http.StatusTemporaryRedirect)
				return
			}
			u, _ := url.Parse(t3Origin)
			u.Path = strings.TrimPrefix(path, "/t3")
			if u.Path == "" {
				u.Path = "/"
			}
			u.RawQuery = r.URL.RawQuery
			w.Header().Set("Cache-Control", "no-store")
			http.Redirect(w, r, u.String(), http.StatusTemporaryRedirect)
			return
		}
		if lower == "/sunshine" || strings.HasPrefix(lower, "/sunshine/") {
			if !strings.HasPrefix(path, "/sunshine") {
				u := *r.URL
				u.Path = "/sunshine" + path[len("/sunshine"):]
				u.RawPath = ""
				http.Redirect(w, r, u.String(), http.StatusTemporaryRedirect)
				return
			}
			r.URL.Path = strings.TrimPrefix(path, "/sunshine")
			if r.URL.Path == "" {
				r.URL.Path = "/"
			}
			r.URL.RawPath = ""
		}
		proxy.ServeHTTP(w, r)
	})
	server := &http.Server{
		Addr: "127.0.0.1:47991", Handler: handler,
		ReadHeaderTimeout: 15 * time.Second, IdleTimeout: 90 * time.Second,
	}
	log.Printf("Godseye gateway listening on %s", server.Addr)
	log.Fatal(server.ListenAndServe())
}
