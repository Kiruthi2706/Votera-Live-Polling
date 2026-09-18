import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function Dashboard({ onCreatePoll, onOpenPoll }) {
    const [polls, setPolls] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    // =====================================================
    // LOAD POLLS
    // =====================================================

    async function loadPolls() {
        setLoading(true);
        setMessage("");

        try {
            const { response, data } = await apiRequest("/api/polls");

            if (!response.ok) {
                setMessage(
                    data.error || "Could not load polls."
                );
                return;
            }

            setPolls(data.polls || []);
        } catch (error) {
            console.error(error);
            setMessage("Cannot connect to backend.");
        } finally {
            setLoading(false);
        }
    }

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        loadPolls();
    }, []);

    // =====================================================
    // REAL-TIME WEBSOCKET
    // =====================================================

    useEffect(() => {
        if (polls.length === 0) {
            return;
        }

        const sockets = [];

        polls.forEach((poll) => {
            const protocol =
                window.location.protocol === "https:"
                    ? "wss:"
                    : "ws:";

            const host =
                window.location.hostname === "localhost"
                    ? "localhost:8080"
                    : window.location.host;

            const wsUrl =
                `${protocol}//${host}/api/polls/${poll.id}/ws`;

            const socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                console.log(
                    "Dashboard WebSocket connected:",
                    poll.id
                );
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === "vote_update") {
                        setPolls((currentPolls) => {
                            return currentPolls.map(
                                (currentPoll) => {
                                    if (
                                        currentPoll.id !==
                                        data.poll_id
                                    ) {
                                        return currentPoll;
                                    }

                                    const updatedVotes = [
                                        ...(currentPoll.votes || [])
                                    ];

                                    updatedVotes[data.option] =
                                        Number(data.votes);

                                    return {
                                        ...currentPoll,
                                        votes: updatedVotes
                                    };
                                }
                            );
                        });
                    }
                } catch (error) {
                    console.error(
                        "WebSocket message error:",
                        error
                    );
                }
            };

            socket.onerror = (error) => {
                console.error(
                    "Dashboard WebSocket error:",
                    error
                );
            };

            socket.onclose = () => {
                console.log(
                    "Dashboard WebSocket disconnected:",
                    poll.id
                );
            };

            sockets.push(socket);
        });

        return () => {
            sockets.forEach((socket) => {
                socket.close();
            });
        };
    }, [polls.length]);

    // =====================================================
    // SEARCH
    // =====================================================

    const filteredPolls = polls.filter((poll) =>
        poll.question
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // =====================================================
    // TOTAL VOTES
    // =====================================================

    const totalVotes = polls.reduce(
        (total, poll) =>
            total +
            (poll.votes || []).reduce(
                (sum, value) =>
                    sum + Number(value || 0),
                0
            ),
        0
    );

    // =====================================================
    // PERCENTAGE
    // =====================================================

    function getPercentage(votes, total) {
        if (!total) return 0;

        return Math.round((votes / total) * 100);
    }

    // =====================================================
    // OPTION COLORS
    // =====================================================

    const optionClasses = [
        "poll-option-purple",
        "poll-option-pink",
        "poll-option-green",
        "poll-option-yellow",
        "poll-option-blue",
        "poll-option-orange"
    ];

    // =====================================================
    // SHARE POLL
    // =====================================================

    function sharePoll(pollId) {
        const link =
            `${window.location.origin}/?poll=${pollId}`;

        navigator.clipboard
            .writeText(link)
            .then(() => {
                alert("Poll link copied!");
            })
            .catch(() => {
                alert(link);
            });
    }

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="dashboard-modern">

            {/* =================================================
                DASHBOARD HEADER
            ================================================= */}

            <header className="modern-dashboard-header">

                <div className="dashboard-heading">

                    <div className="live-pill">
                        <span className="live-dot"></span>
                        Live Polling
                    </div>

                    <h1>Dashboard</h1>

                    <p>
                        Create, share and manage your live polls.
                    </p>

                </div>

                <button
                    className="modern-create-btn"
                    onClick={onCreatePoll}
                >
                    <span className="plus-icon">+</span>
                    Create Poll
                </button>

            </header>


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <section className="modern-stats">

                {/* TOTAL POLLS */}

                <div className="modern-stat-card purple-stat">

                    <div className="stat-icon">
                        ▥
                    </div>

                    <div className="stat-content">

                        <span className="stat-label">
                            Total Polls
                        </span>

                        <strong>
                            {polls.length}
                        </strong>

                        <small>
                            ↗ Active &amp; running
                        </small>

                    </div>

                    <div className="stat-decoration"></div>

                </div>


                {/* TOTAL VOTES */}

                <div className="modern-stat-card green-stat">

                    <div className="stat-icon">
                        ♟
                    </div>

                    <div className="stat-content">

                        <span className="stat-label">
                            Total Votes
                        </span>

                        <strong>
                            {totalVotes}
                        </strong>

                        <small>
                            ↗ Live updates
                        </small>

                    </div>

                    <div className="stat-decoration"></div>

                </div>


                {/* ACTIVE POLLS */}

                <div className="modern-stat-card orange-stat">

                    <div className="stat-icon">
                        ⚡
                    </div>

                    <div className="stat-content">

                        <span className="stat-label">
                            Active Polls
                        </span>

                        <strong>
                            {polls.length}
                        </strong>

                        <small>
                            ↗ Currently live
                        </small>

                    </div>

                    <div className="stat-decoration"></div>

                </div>

            </section>


            {/* =================================================
                MY POLLS CONTAINER
            ================================================= */}

            <section className="my-polls-container">

                {/* HEADER */}

                <div className="my-polls-header">

                    <div className="my-polls-title">

                        <div className="my-polls-icon">
                            ☷
                        </div>

                        <div>
                            <h2>My Polls</h2>

                            <p>
                                Polls created by your account.
                            </p>
                        </div>

                    </div>


                    <div className="modern-search">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search polls..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                </div>


                {/* =================================================
                    CONTENT
                ================================================= */}

                {loading && (
                    <div className="modern-empty">
                        <div className="loading-spinner"></div>
                        <h3>Loading polls...</h3>
                    </div>
                )}


                {!loading && message && (
                    <div className="modern-empty">

                        <div className="empty-icon-large">
                            !
                        </div>

                        <h3>{message}</h3>

                        <button
                            className="modern-create-btn"
                            onClick={loadPolls}
                        >
                            Try Again
                        </button>

                    </div>
                )}


                {!loading &&
                    !message &&
                    filteredPolls.length === 0 && (

                        <div className="modern-empty">

                            <div className="empty-icon-large">
                                +
                            </div>

                            <h3>
                                {search
                                    ? "No matching polls"
                                    : "No polls yet"}
                            </h3>

                            <p>
                                {search
                                    ? "Try another search."
                                    : "Create your first poll and start collecting live responses."}
                            </p>

                            {!search && (
                                <button
                                    className="modern-create-btn"
                                    onClick={onCreatePoll}
                                >
                                    Create Your First Poll
                                </button>
                            )}

                        </div>
                    )}


                {/* =================================================
                    POLL + SIDE PANEL
                ================================================= */}

                {!loading &&
                    !message &&
                    filteredPolls.length > 0 && (

                        <div className="dashboard-poll-layout">

                            {/* POLL LIST */}

                            <div className="modern-poll-list">

                                {filteredPolls.map((poll) => {

                                    const votes =
                                        (poll.votes || []).reduce(
                                            (sum, value) =>
                                                sum +
                                                Number(value || 0),
                                            0
                                        );

                                    return (

                                        <div
                                            className="modern-poll-card"
                                            key={poll.id}
                                        >

                                            {/* LEFT ACCENT */}

                                            <div className="poll-left-accent"></div>


                                            {/* POLL HEADER */}

                                            <div className="modern-poll-top">

                                                <span className="modern-live-badge">
                                                    <span></span>
                                                    LIVE
                                                </span>

                                                <span className="modern-vote-count">
                                                    ♟ {votes}{" "}
                                                    {votes === 1
                                                        ? "vote"
                                                        : "votes"}
                                                </span>

                                            </div>


                                            {/* QUESTION */}

                                            <h3 className="modern-poll-question">
                                                {poll.question}
                                            </h3>


                                            {/* OPTIONS */}

                                            <div className="modern-options">

                                                {poll.options.map(
                                                    (
                                                        option,
                                                        index
                                                    ) => {

                                                        const optionVotes =
                                                            Number(
                                                                (
                                                                    poll.votes ||
                                                                    []
                                                                )[index] || 0
                                                            );

                                                        const percentage =
                                                            getPercentage(
                                                                optionVotes,
                                                                votes
                                                            );

                                                        const colorClass =
                                                            optionClasses[
                                                                index %
                                                                    optionClasses.length
                                                            ];

                                                        return (

                                                            <div
                                                                className="modern-option"
                                                                key={index}
                                                            >

                                                                <div className="option-row">

                                                                    <span className="option-name">
                                                                        {option}
                                                                    </span>

                                                                    <span className="option-result">
                                                                        <strong>
                                                                            {optionVotes}
                                                                        </strong>

                                                                        <span>
                                                                            ({percentage}%)
                                                                        </span>
                                                                    </span>

                                                                </div>


                                                                <div className="modern-progress">

                                                                    <div
                                                                        className={`modern-progress-fill ${colorClass}`}
                                                                        style={{
                                                                            width:
                                                                                `${percentage}%`
                                                                        }}
                                                                    ></div>

                                                                </div>

                                                            </div>
                                                        );
                                                    }
                                                )}

                                            </div>


                                            {/* CARD FOOTER */}

                                            <div className="modern-poll-footer">

                                                <span className="created-time">
                                                    ◷ Created just now
                                                </span>

                                                <div className="poll-footer-actions">

                                                    <button
                                                        className="share-poll-btn"
                                                        onClick={() =>
                                                            sharePoll(
                                                                poll.id
                                                            )
                                                        }
                                                    >
                                                        ↗ Share Poll
                                                    </button>

                                                    <button
                                                        className="view-poll-btn"
                                                        onClick={() =>
                                                            onOpenPoll(
                                                                poll.id
                                                            )
                                                        }
                                                    >
                                                        View →
                                                    </button>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                })}

                            </div>


                            {/* =================================================
                                RIGHT INFORMATION PANEL
                            ================================================= */}

                            <aside className="voice-panel">

                                <div className="voice-illustration">

                                    <div className="voice-cloud">
                                        ✓
                                    </div>

                                    <div className="voice-box">
                                        ◈
                                    </div>

                                    <div className="voice-dot dot-one"></div>
                                    <div className="voice-dot dot-two"></div>
                                    <div className="voice-dot dot-three"></div>

                                </div>

                                <h3>
                                    Your voice matters!
                                </h3>

                                <p>
                                    Create a poll and see
                                    real-time results as
                                    people vote.
                                </p>

                                <button
                                    className="voice-create-btn"
                                    onClick={onCreatePoll}
                                >
                                    + Create a Poll
                                </button>

                            </aside>

                        </div>
                    )}

            </section>

        </div>
    );
}

export default Dashboard;