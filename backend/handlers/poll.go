package handlers

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"

	"live-polling/config"
	"live-polling/models"
)

// =========================
// CREATE POLL
// =========================

func CreatePoll(c *gin.Context) {

	var input struct {
		Question string   `json:"question"`
		Options  []string `json:"options"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})

		return
	}

	input.Question = strings.TrimSpace(input.Question)

	if input.Question == "" {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Question is required",
		})

		return
	}

	if len(input.Options) < 2 {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "At least 2 options are required",
		})

		return
	}

	for i := range input.Options {

		input.Options[i] =
			strings.TrimSpace(input.Options[i])

		if input.Options[i] == "" {

			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Options cannot be empty",
			})

			return
		}
	}

	// =========================
	// GET LOGGED-IN USER
	// =========================

	userID, exists := c.Get("user_id")

	if !exists {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})

		return
	}

	userIDString, ok := userID.(string)

	if !ok {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user ID",
		})

		return
	}

	// =========================
	// CREATE VOTE COUNTERS
	// =========================

	votes := make(
		[]int,
		len(input.Options),
	)

	// =========================
	// CREATE POLL
	// =========================

	poll := models.Poll{

		ID: bson.NewObjectID(),

		Question: input.Question,

		Options: input.Options,

		Votes: votes,

		CreatedBy: userIDString,

		CreatedAt: time.Now(),
	}

	collection :=
		config.MongoDB.Collection("polls")

	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)

	defer cancel()

	// =========================
	// SAVE POLL IN MONGODB
	// =========================

	_, err := collection.InsertOne(
		ctx,
		poll,
	)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not create poll",
		})

		return
	}

	// =========================
	// INITIALIZE REDIS COUNTERS
	// =========================

	for i := range input.Options {

		key := "poll:" +
			poll.ID.Hex() +
			":option:" +
			strconv.Itoa(i)

		err := config.RedisClient.Set(
			ctx,
			key,
			0,
			0,
		).Err()

		if err != nil {

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Could not initialize vote counters",
			})

			return
		}
	}

	// =========================
	// RESPONSE
	// =========================

	c.JSON(http.StatusCreated, gin.H{

		"message": "Poll created successfully",

		"poll": poll,
	})
}

// =========================
// GET ALL POLLS
// =========================

func GetAllPolls(c *gin.Context) {

	collection :=
		config.MongoDB.Collection("polls")

	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)

	defer cancel()

	cursor, err := collection.Find(
		ctx,
		bson.M{},
	)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not fetch polls",
		})

		return
	}

	defer cursor.Close(ctx)

	var polls []models.Poll

	if err := cursor.All(
		ctx,
		&polls,
	); err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not read polls",
		})

		return
	}

	if polls == nil {
		polls = []models.Poll{}
	}

	// =========================
	// GET VOTE COUNTS FROM REDIS
	// =========================

	for i := range polls {

		if len(polls[i].Votes) !=
			len(polls[i].Options) {

			polls[i].Votes =
				make(
					[]int,
					len(polls[i].Options),
				)
		}

		for j := range polls[i].Options {

			key := "poll:" +
				polls[i].ID.Hex() +
				":option:" +
				strconv.Itoa(j)

			value, err :=
				config.RedisClient.Get(
					ctx,
					key,
				).Int()

			if err == nil {

				polls[i].Votes[j] =
					value
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{

		"polls": polls,
	})
}

// =========================
// GET SINGLE POLL
// =========================

func GetPoll(c *gin.Context) {

	id := c.Param("id")

	pollID, err :=
		bson.ObjectIDFromHex(id)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid poll ID",
		})

		return
	}

	collection :=
		config.MongoDB.Collection("polls")

	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)

	defer cancel()

	var poll models.Poll

	err = collection.FindOne(
		ctx,
		bson.M{
			"_id": pollID,
		},
	).Decode(&poll)

	if err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "Poll not found",
		})

		return
	}

	if len(poll.Votes) !=
		len(poll.Options) {

		poll.Votes =
			make(
				[]int,
				len(poll.Options),
			)
	}

	// =========================
	// GET LATEST VOTES FROM REDIS
	// =========================

	for i := range poll.Options {

		key := "poll:" +
			id +
			":option:" +
			strconv.Itoa(i)

		value, err :=
			config.RedisClient.Get(
				ctx,
				key,
			).Int()

		if err == nil {

			poll.Votes[i] =
				value
		}
	}

	c.JSON(http.StatusOK, gin.H{

		"poll": poll,
	})
}

// =========================
// VOTE
// =========================

func Vote(c *gin.Context) {

	id := c.Param("id")

	pollID, err :=
		bson.ObjectIDFromHex(id)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid poll ID",
		})

		return
	}

	// =========================
	// AUDIENCE INFORMATION
	// =========================

	var input struct {

		// Option is the index:
		// 0 = first option
		// 1 = second option
		// 2 = third option
		Option int `json:"option"`

		Name string `json:"name"`

		Email string `json:"email"`
	}

	if err := c.ShouldBindJSON(
		&input,
	); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})

		return
	}

	// =========================
	// CLEAN INPUT
	// =========================

	input.Name =
		strings.TrimSpace(input.Name)

	input.Email =
		strings.ToLower(
			strings.TrimSpace(input.Email),
		)

	// =========================
	// VALIDATE NAME AND EMAIL
	// =========================

	if input.Name == "" ||
		input.Email == "" {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Name and email are required",
		})

		return
	}

	collection :=
		config.MongoDB.Collection("polls")

	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)

	defer cancel()

	// =========================
	// FIND POLL
	// =========================

	var poll models.Poll

	err = collection.FindOne(
		ctx,
		bson.M{
			"_id": pollID,
		},
	).Decode(&poll)

	if err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "Poll not found",
		})

		return
	}

	// =========================
	// VALIDATE OPTION
	// =========================

	if input.Option < 0 ||
		input.Option >= len(poll.Options) {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid option",
		})

		return
	}

	// =========================
	// CHECK DUPLICATE EMAIL
	// =========================

	votesCollection :=
		config.MongoDB.Collection("votes")

	var existingVote bson.M

	err = votesCollection.FindOne(
		ctx,
		bson.M{
			"poll_id": pollID,
			"email":   input.Email,
		},
	).Decode(&existingVote)

	if err == nil {

		c.JSON(http.StatusConflict, gin.H{
			"error": "This email has already voted in this poll",
		})

		return
	}

	// =========================
	// SAVE VOTER INFORMATION
	// =========================

	voteDocument := bson.M{

		"poll_id": pollID,

		"name": input.Name,

		"email": input.Email,

		"option": input.Option,

		"created_at": time.Now(),
	}

	_, err =
		votesCollection.InsertOne(
			ctx,
			voteDocument,
		)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not save voter information",
		})

		return
	}

	// =========================
	// INCREMENT REDIS COUNTER
	// =========================

	key := "poll:" +
		id +
		":option:" +
		strconv.Itoa(input.Option)

	count, err :=
		config.RedisClient.Incr(
			ctx,
			key,
		).Result()

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not record vote",
		})

		return
	}

	// =========================
	// REAL-TIME UPDATE
	// =========================

	BroadcastPollUpdate(
		id,
		gin.H{

			"type": "vote_update",

			"poll_id": id,

			"option": input.Option,

			"votes": count,
		},
	)

	// =========================
	// RESPONSE
	// =========================

	c.JSON(http.StatusOK, gin.H{

		"message": "Vote recorded successfully",

		"name": input.Name,

		"option": input.Option,

		"votes": count,
	})
}

// =========================
// DELETE POLL
// =========================

func DeletePoll(c *gin.Context) {

	id := c.Param("id")

	pollID, err :=
		bson.ObjectIDFromHex(id)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid poll ID",
		})

		return
	}

	// =========================
	// GET LOGGED-IN USER
	// =========================

	userID, exists :=
		c.Get("user_id")

	if !exists {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})

		return
	}

	userIDString, ok :=
		userID.(string)

	if !ok {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user ID",
		})

		return
	}

	collection :=
		config.MongoDB.Collection("polls")

	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)

	defer cancel()

	// =========================
	// DELETE ONLY OWN POLL
	// =========================

	result, err :=
		collection.DeleteOne(
			ctx,
			bson.M{
				"_id": pollID,

				"created_by": userIDString,
			},
		)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not delete poll",
		})

		return
	}

	if result.DeletedCount == 0 {

		c.JSON(http.StatusForbidden, gin.H{
			"error": "You can delete only your own polls",
		})

		return
	}

	// =========================
	// DELETE VOTE RECORDS
	// =========================

	votesCollection :=
		config.MongoDB.Collection("votes")

	_, _ =
		votesCollection.DeleteMany(
			ctx,
			bson.M{
				"poll_id": pollID,
			},
		)

	// =========================
	// DELETE REDIS COUNTERS
	// =========================

	for i := 0; i < 10; i++ {

		key := "poll:" +
			id +
			":option:" +
			strconv.Itoa(i)

		_ = config.RedisClient.Del(
			ctx,
			key,
		).Err()
	}

	// =========================
	// RESPONSE
	// =========================

	c.JSON(http.StatusOK, gin.H{

		"message": "Poll deleted successfully",
	})
}