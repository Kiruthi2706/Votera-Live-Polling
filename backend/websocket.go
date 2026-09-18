package main

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

// WebSocket connection handler
func WebSocketHandler(c *gin.Context) {

	pollID := c.Param("id")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	client := &Client{
		conn:   conn,
		pollID: pollID,
	}

	clientsMu.Lock()
	clients[client] = true
	clientsMu.Unlock()

	defer func() {

		clientsMu.Lock()
		delete(clients, client)
		clientsMu.Unlock()

		conn.Close()
	}()

	// Keep connection alive
	for {
		_, _, err := conn.ReadMessage()

		if err != nil {
			break
		}
	}
}

// Send updated poll results to all users
// connected to the same poll
func BroadcastPollUpdate(pollID string, data interface{}) {

	clientsMu.Lock()
	defer clientsMu.Unlock()

	for client := range clients {

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