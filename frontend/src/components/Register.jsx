import { useState } from "react";

import {
    apiRequest
} from "../services/api";


function Register({ onLogin }) {

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [success, setSuccess] =
        useState(false);

    const [loading, setLoading] =
        useState(false);


    async function handleSubmit(event) {

        event.preventDefault();

        setMessage("");
        setSuccess(false);


        if (
            !name.trim() ||
            !email.trim() ||
            !password
        ) {

            setMessage(
                "Please fill all fields."
            );

            return;
        }


        if (password.length < 6) {

            setMessage(
                "Password must be at least 6 characters."
            );

            return;
        }


        setLoading(true);


        try {

            const { response, data } =
                await apiRequest(
                    "/api/register",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            name,
                            email,
                            password
                        })
                    }
                );


            if (!response.ok) {

                setMessage(
                    data.error ||
                    "Registration failed."
                );

                return;
            }


            setSuccess(true);

            setMessage(
                "Registration successful. Please login."
            );


            setName("");
            setEmail("");
            setPassword("");


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

        <div className="auth-page">

            <div className="auth-card">

                <div className="logo">
                    VOTERA
                </div>


                <h1>
                    Create Account
                </h1>


                <p className="auth-subtitle">
                    Join the live polling platform
                </p>


                <form
                    onSubmit={handleSubmit}
                >

                    <label>
                        Name
                    </label>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />


                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />


                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }
                    />


                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Account"}
                    </button>

                </form>


                {message && (

                    <p
                        className={
                            success
                                ? "success-message"
                                : "error-message"
                        }
                    >
                        {message}
                    </p>

                )}


                <p className="switch-text">

                    Already have an account?

                    <button
                        type="button"
                        className="link-btn"
                        onClick={onLogin}
                    >
                        Login
                    </button>

                </p>

            </div>

        </div>
    );
}


export default Register;