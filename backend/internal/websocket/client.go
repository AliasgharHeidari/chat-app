package websocket

import "github.com/gofiber/websocket/v2"


type Client struct {
	ID   uint           
	Conn *websocket.Conn 
	Send chan []byte    
}


func NewClient(id uint, conn *websocket.Conn) *Client {
	return &Client{
		ID:   id,
		Conn: conn,
		Send: make(chan []byte, 100),
	}
}