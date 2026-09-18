package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	"live-polling/config"
	"live-polling/handlers"
	"live-polling/middleware"
)

func main() {

	// =========================
	// LOAD CONFIGURATION
	// =========================

	config.LoadConfig()

	// =========================
	// CREATE ROUTER
	// =========================

	router := gin.Default()

	// =========================
	// CORS
	// =========================

	router.Use(func(c *gin.Context) {

		c.Writer.Header().Set(
			"Access-Control-Allow-Origin",
			"*",
		)

		c.Writer.Header().Set(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, DELETE, OPTIONS",
		)

		c.Writer.Header().Set(
			"Access-Control-Allow-Headers",
			"Origin, Content-Type, Authorization",
		)

		if c.Request.Method == "OPTIONS" {

			c.AbortWithStatus(
				http.StatusNoContent,
			)

			return
		}

		c.Next()
	})

	// =========================
	// PUBLIC AUTH ROUTES
	// =========================

	router.POST(
		"/api/register",
		handlers.Register,
	)

	router.POST(
		"/api/login",
		handlers.Login,
	)

	// =========================
	// PROTECTED CREATOR ROUTES
	// =========================

	protected := router.Group("/api")

	protected.Use(
		middleware.AuthMiddleware(),
	)

	{
		// Create poll
		protected.POST(
			"/polls",
			handlers.CreatePoll,
		)

		// Get all polls
		protected.GET(
			"/polls",
			handlers.GetAllPolls,
		)

		// Delete own poll
		protected.DELETE(
			"/polls/:id",
			handlers.DeletePoll,
		)
	}

	// =========================
	// PUBLIC AUDIENCE ROUTES
	// =========================

	// View shared poll
	router.GET(
		"/api/polls/:id",
		handlers.GetPoll,
	)

	// Vote on shared poll
	router.POST(
		"/api/polls/:id/vote",
		handlers.Vote,
	)

	// =========================
	// WEBSOCKET ROUTE
	// =========================

	// Real-time vote updates
	router.GET(
		"/api/polls/:id/ws",
		handlers.WebSocketHandler,
	)

	// =========================
	// SERVER
	// =========================

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	fmt.Println("=================================")
	fmt.Println("       VOTERA LIVE POLLING")
	fmt.Println("=================================")

	fmt.Println(
		"Server running on http://localhost:" + port,
	)

	err := router.Run(":" + port)

	if err != nil {

		fmt.Println(
			"Server failed to start:",
			err,
		)
	}
}