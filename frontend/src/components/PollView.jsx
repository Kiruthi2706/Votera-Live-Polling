import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function PollView({ pollId, audienceMode = false, onBack }) {

    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [selectedOption, setSelectedOption] = useState(null);

    const [voted, setVoted] = useState(false);
    const [message, setMessage] = useState("");
    const [copied, setCopied] = useState(false);


    // =====================================================
    // LOAD POLL
    // =====================================================

    async function loadPoll() {

        try {

            const { response, data } =
                await apiRequest(
                    `/api/polls/${pollId}`
                );

            if (!response.ok) {

                setError(
                    data.error ||
                    "Could not load poll"
                );

                return;
            }

            setPoll(data.poll);

        } catch (err) {

            console.error(err);

            setError(
                "Could not load poll"
            );

        } finally {

            setLoading(false);
        }
    }


    // =====================================================
    // LOAD ON POLL ID CHANGE
    // =====================================================

    useEffect(() => {

        if (!pollId) return;

        loadPoll();

    }, [pollId]);


    // =====================================================
    // WEBSOCKET - REAL TIME
    // =====================================================

    useEffect(() => {

        if (!pollId) return;


        const protocol =
            window.location.protocol === "https:"
                ? "wss:"
                : "ws:";


        const host =
            window.location.hostname === "localhost"
                ? "localhost:8080"
                : window.location.host;


        const wsUrl =
            `${protocol}//${host}/api/polls/${pollId}/ws`;


        console.log(
            "Connecting WebSocket:",
            wsUrl
        );


        const socket =
            new WebSocket(wsUrl);


        socket.onopen = () => {

            console.log(
                "WebSocket connected"
            );
        };


        socket.onmessage = (event) => {

            try {

                const data =
                    JSON.parse(event.data);


                console.log(
                    "LIVE UPDATE:",
                    data
                );


                if (
                    data.type ===
                    "vote_update"
                ) {

                    setPoll((currentPoll) => {

                        if (!currentPoll) {
                            return currentPoll;
                        }


                        const updatedVotes = [
                            ...(currentPoll.votes || [])
                        ];


                        updatedVotes[data.option] =
                            data.votes;


                        return {
                            ...currentPoll,
                            votes: updatedVotes
                        };

                    });
                }

            } catch (err) {

                console.error(
                    "WebSocket message error:",
                    err
                );
            }
        };


        socket.onerror = (error) => {

            console.error(
                "WebSocket error:",
                error
            );
        };


        socket.onclose = () => {

            console.log(
                "WebSocket disconnected"
            );
        };


        return () => {

            socket.close();

        };

    }, [pollId]);


    // =====================================================
    // SHARE LINK
    // =====================================================

    const shareLink =
        `${window.location.origin}/?poll=${pollId}`;


    async function copyShareLink() {

        try {

            await navigator.clipboard.writeText(
                shareLink
            );

            setCopied(true);


            setTimeout(() => {

                setCopied(false);

            }, 2000);

        } catch (err) {

            console.error(
                "Copy failed:",
                err
            );

        }
    }


    function openAudiencePoll() {

        window.open(
            shareLink,
            "_blank"
        );
    }


    // =====================================================
    // VOTE
    // =====================================================

    async function handleVote(e) {

        e.preventDefault();

        setMessage("");


        if (
            selectedOption === null ||
            selectedOption === undefined
        ) {

            setMessage(
                "Please select an option"
            );

            return;
        }


        if (!name.trim()) {

            setMessage(
                "Please enter your name"
            );

            return;
        }


        if (!email.trim()) {

            setMessage(
                "Please enter your email"
            );

            return;
        }


        const requestBody = {

            name: name.trim(),

            email: email.trim(),

            option: selectedOption

        };


        console.log(
            "VOTE REQUEST:",
            requestBody
        );


        try {

            const { response, data } =
                await apiRequest(
                    `/api/polls/${pollId}/vote`,
                    {
                        method: "POST",

                        body:
                            JSON.stringify(
                                requestBody
                            )
                    }
                );


            console.log(
                "VOTE RESPONSE:",
                response.status,
                data
            );


            if (!response.ok) {

                setMessage(
                    data.error ||
                    "Could not submit vote"
                );

                return;
            }


            setVoted(true);


            setMessage(
                "Vote recorded successfully!"
            );


            setPoll((currentPoll) => {

                if (!currentPoll) {
                    return currentPoll;
                }


                const updatedVotes = [
                    ...(currentPoll.votes || [])
                ];


                updatedVotes[selectedOption] =
                    data.votes;


                return {

                    ...currentPoll,

                    votes: updatedVotes

                };

            });

        } catch (err) {

            console.error(err);

            setMessage(
                "Could not connect to server"
            );
        }
    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="poll-page">

                <div className="poll-container">

                    <div className="poll-card">

                        <p>
                            Loading poll...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error || !poll) {

        return (

            <div className="poll-page">

                <div className="poll-container">

                    <div className="poll-card">

                        <h2>
                            Poll unavailable
                        </h2>

                        <p>
                            {error ||
                                "Poll not found"}
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // TOTAL VOTES
    // =====================================================

    const totalVotes =
        (poll.votes || []).reduce(
            (sum, value) =>
                sum + Number(value || 0),
            0
        );


    // =====================================================
    // MAIN UI
    // =====================================================

    return (

        <div className="poll-page">

            <div className="poll-container">

                {/* =========================================
                    BACK BUTTON
                ========================================= */}

                {!audienceMode && onBack && (

                    <button
                        className="poll-back-button"
                        onClick={onBack}
                    >
                        ← Back to Dashboard
                    </button>

                )}


                {/* =========================================
                    CREATOR SHARE SECTION
                ========================================= */}

                {!audienceMode && (

                    <div className="share-card">

                        <div className="share-content">

                            <div>

                                <div className="share-title">
                                    🔗 Share this poll
                                </div>

                                <div className="share-subtitle">
                                    Anyone with this link can vote.
                                </div>

                            </div>

                            <div className="share-actions">

                                <button
                                    className="copy-link-button"
                                    onClick={
                                        copyShareLink
                                    }
                                >
                                    {copied
                                        ? "✓ Copied!"
                                        : "Copy Link"}
                                </button>


                                <button
                                    className="open-link-button"
                                    onClick={
                                        openAudiencePoll
                                    }
                                >
                                    Open Poll
                                </button>

                            </div>

                        </div>


                        <div className="share-link-box">

                            <input
                                type="text"
                                value={shareLink}
                                readOnly
                                onClick={(e) =>
                                    e.target.select()
                                }
                            />

                        </div>

                    </div>
                )}


                {/* =========================================
                    POLL CARD
                ========================================= */}

                <div className="poll-card">

                    <div className="poll-header">

                        <span className="live-badge">
                            ● LIVE
                        </span>

                        <h1>
                            {poll.question}
                        </h1>

                        <p className="poll-total">

                            {totalVotes}

                            {" "}

                            {totalVotes === 1
                                ? "vote"
                                : "votes"}

                        </p>

                    </div>


                    {/* =====================================
                        VOTING FORM
                    ===================================== */}

                    {!voted ? (

                        <form
                            onSubmit={handleVote}
                            className="vote-form"
                        >

                            {/* NAME */}

                            <div className="form-group">

                                <label>
                                    Your Name
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your name"
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="form-group">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your email"
                                />

                            </div>


                            {/* OPTIONS */}

                            <div className="form-group">

                                <label>
                                    Select an option
                                </label>


                                <div className="vote-options">

                                    {poll.options.map(
                                        (option, index) => {

                                            const isSelected =
                                                selectedOption ===
                                                index;


                                            const votes =
                                                Number(
                                                    poll.votes?.[
                                                        index
                                                    ] || 0
                                                );


                                            return (

                                                <button

                                                    key={index}

                                                    type="button"

                                                    className={
                                                        isSelected
                                                            ? "vote-option selected"
                                                            : "vote-option"
                                                    }

                                                    onClick={() =>
                                                        setSelectedOption(
                                                            index
                                                        )
                                                    }

                                                >

                                                    <span className="radio-circle">

                                                        {isSelected &&
                                                            "✓"}

                                                    </span>


                                                    <span className="option-text">

                                                        {option}

                                                    </span>


                                                    <span className="option-votes">

                                                        {votes}

                                                    </span>

                                                </button>

                                            );
                                        }
                                    )}

                                </div>

                            </div>


                            {/* MESSAGE */}

                            {message && (

                                <div className="vote-message">

                                    {message}

                                </div>

                            )}


                            {/* SUBMIT */}

                            <button
                                type="submit"
                                className="submit-vote"
                            >
                                Submit Vote
                            </button>

                        </form>

                    ) : (

                        /* =================================
                           AFTER VOTE
                        ================================= */

                        <div className="vote-success">

                            <div className="success-icon">
                                ✓
                            </div>


                            <h2>
                                Thank you, {name}!
                            </h2>


                            <p>
                                Your vote has been
                                recorded successfully.
                            </p>


                            <div className="results">

                                <h3>
                                    Live Results
                                </h3>


                                {poll.options.map(
                                    (option, index) => {

                                        const votes =
                                            Number(
                                                poll.votes?.[
                                                    index
                                                ] || 0
                                            );


                                        const percentage =
                                            totalVotes > 0
                                                ? Math.round(
                                                    (votes /
                                                        totalVotes) *
                                                        100
                                                )
                                                : 0;


                                        return (

                                            <div
                                                key={index}
                                                className="result-item"
                                            >

                                                <div className="result-top">

                                                    <span>
                                                        {option}
                                                    </span>

                                                    <span>
                                                        {votes} (
                                                        {percentage}
                                                        %)
                                                    </span>

                                                </div>


                                                <div className="result-bar">

                                                    <div
                                                        className="result-fill"
                                                        style={{
                                                            width:
                                                                `${percentage}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}


export default PollView;