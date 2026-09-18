import { useState } from "react";

import { apiRequest } from "../services/api";


function CreatePoll({
    onPollCreated,
    onBack
}) {

    const [question, setQuestion] =
        useState("");

    const [options, setOptions] =
        useState([
            "",
            "",
            "",
            ""
        ]);

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [success, setSuccess] =
        useState(false);


    // =========================
    // UPDATE OPTION
    // =========================

    function updateOption(index, value) {

        const newOptions = [
            ...options
        ];

        newOptions[index] = value;

        setOptions(newOptions);
    }


    // =========================
    // ADD OPTION
    // =========================

    function addOption() {

        if (options.length >= 6) {

            setMessage(
                "Maximum 6 options are allowed."
            );

            setSuccess(false);

            return;
        }

        setOptions([
            ...options,
            ""
        ]);
    }


    // =========================
    // REMOVE OPTION
    // =========================

    function removeOption(index) {

        if (options.length <= 2) {

            setMessage(
                "A poll must have at least 2 options."
            );

            setSuccess(false);

            return;
        }


        const newOptions =
            options.filter(
                (_, i) =>
                    i !== index
            );

        setOptions(newOptions);
    }


    // =========================
    // CREATE POLL
    // =========================

    async function handleSubmit(event) {

        event.preventDefault();

        setMessage("");
        setSuccess(false);


        const cleanQuestion =
            question.trim();


        const cleanOptions =
            options
                .map((option) =>
                    option.trim()
                )
                .filter(
                    (option) =>
                        option !== ""
                );


        // Question validation

        if (!cleanQuestion) {

            setMessage(
                "Please enter a poll question."
            );

            return;
        }


        // Option validation

        if (cleanOptions.length < 2) {

            setMessage(
                "Please provide at least 2 options."
            );

            return;
        }


        // Duplicate option validation

        const uniqueOptions =
            new Set(
                cleanOptions.map(
                    (option) =>
                        option.toLowerCase()
                )
            );


        if (
            uniqueOptions.size !==
            cleanOptions.length
        ) {

            setMessage(
                "Options must be different."
            );

            return;
        }


        setLoading(true);


        try {

            const {
                response,
                data
            } = await apiRequest(
                "/api/polls",
                {
                    method: "POST",

                    body: JSON.stringify({
                        question:
                            cleanQuestion,

                        options:
                            cleanOptions
                    })
                }
            );


            if (!response.ok) {

                setMessage(
                    data.error ||
                    "Could not create poll."
                );

                return;
            }


            setSuccess(true);

            setMessage(
                "Poll created successfully!"
            );


            // Send created poll to App

            if (onPollCreated) {

                onPollCreated(
                    data.poll
                );
            }


        } catch (error) {

            console.error(error);

            setMessage(
                "Cannot connect to backend."
            );

        } finally {

            setLoading(false);
        }
    }


    return (

        <div>

            {/* =========================
                HEADER
            ========================= */}

            <header className="top-header">

                <div>

                    <p className="eyebrow">
                        LIVE POLLING
                    </p>

                    <h1>
                        Create Poll
                    </h1>

                    <p className="subtitle">
                        Create a question and add options
                        for your audience.
                    </p>

                </div>


                <button
                    className="back-btn"
                    onClick={onBack}
                >
                    ← Back
                </button>

            </header>


            {/* =========================
                FORM
            ========================= */}

            <form
                className="create-form"
                onSubmit={handleSubmit}
            >

                <div className="form-card">

                    <div className="form-title">

                        <h2>
                            Poll Details
                        </h2>

                        <p>
                            Enter the question you want
                            your audience to answer.
                        </p>

                    </div>


                    {/* QUESTION */}

                    <label>
                        Poll Question
                    </label>

                    <textarea
                        className="question-input"
                        placeholder="Example: Which programming language do you prefer?"
                        value={question}
                        onChange={(e) =>
                            setQuestion(
                                e.target.value
                            )
                        }
                        maxLength={200}
                    />

                    <div className="character-count">
                        {question.length}/200
                    </div>


                    {/* OPTIONS */}

                    <div className="options-header">

                        <div>

                            <label>
                                Answer Options
                            </label>

                            <p>
                                Add at least 2 options.
                            </p>

                        </div>


                        <span>
                            {options.length}/6
                        </span>

                    </div>


                    <div className="create-options">

                        {options.map(
                            (option, index) => (

                                <div
                                    className="option-input-row"
                                    key={index}
                                >

                                    <span className="option-number">
                                        {index + 1}
                                    </span>


                                    <input
                                        type="text"
                                        placeholder={
                                            `Option ${index + 1}`
                                        }
                                        value={option}
                                        onChange={(e) =>
                                            updateOption(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        maxLength={100}
                                    />


                                    {options.length > 2 && (

                                        <button
                                            type="button"
                                            className="remove-option"
                                            onClick={() =>
                                                removeOption(
                                                    index
                                                )
                                            }
                                        >
                                            ×
                                        </button>

                                    )}

                                </div>

                            )
                        )}

                    </div>


                    {/* ADD OPTION */}

                    {options.length < 6 && (

                        <button
                            type="button"
                            className="add-option"
                            onClick={addOption}
                        >
                            + Add Option
                        </button>

                    )}


                    {/* MESSAGE */}

                    {message && (

                        <div
                            className={
                                success
                                    ? "success-message"
                                    : "error-message"
                            }
                        >
                            {message}
                        </div>

                    )}


                    {/* ACTIONS */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onBack}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="primary-btn create-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Poll..."
                                : "Create Poll"}
                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}


export default CreatePoll;