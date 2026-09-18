package handlers

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Client struct {
	conn   *websocket.Conn
	pollID string
}

var (
	clients   = make(map[*Client]bool)
	clientsMu sync.Mutex
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// =========================
// WEBSOCKET HANDLER
// =========================

func WebSocketHandler(c *gin.Context) {

	pollID := c.Param("id")

	conn, err := upgrader.Upgrade(
		c.Writer,
		c.Request,
		nil,
	)

	if err != nil {
		return
	}

	client := &Client{
		conn:   conn,
		pollID: pollID,
	}

	// Add client
	clientsMu.Lock()
	clients[client] = true
	clientsMu.Unlock()

	defer func() {

		// Remove client
		clientsMu.Lock()
		delete(clients, client)
		clientsMu.Unlock()

		conn.Close()
	}()

	// Keep WebSocket connection alive
	for {

		_, _, err := conn.ReadMessage()

		if err != nil {
			break
		}
	}
}

// =========================
// BROADCAST UPDATE
// =========================

func BroadcastPollUpdate(
	pollID string,
	data interface{},
) {

	clientsMu.Lock()
	defer clientsMu.Unlock()

	for client := range clients {

		// Send only to users
		// viewing the same poll
		if client.pollID != pollID {
			continue
		}

		err := client.conn.WriteJSON(data)

		if err != nil {

			client.conn.Close()

			delete(clients, client)
		}
	}
}