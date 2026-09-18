import { useState } from "react";

import {
    apiRequest,
    saveLogin
} from "../services/api";


function Login({ onLogin, onRegister }) {

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    async function handleSubmit(event) {

        event.preventDefault();

        setMessage("");

        if (!email || !password) {

            setMessage(
                "Please enter email and password."
            );

            return;
        }

        setLoading(true);

        try {

            const { response, data } =
                await apiRequest(
                    "/api/login",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );


            if (!response.ok) {

                setMessage(
                    data.error ||
                    "Login failed."
                );

                return;
            }


            saveLogin(
                data.token,
                data.user
            );


            onLogin(data.user);


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
                    Welcome Back
                </h1>


                <p className="auth-subtitle">
                    Login to continue
                </p>


                <form
                    onSubmit={handleSubmit}
                >

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
                        placeholder="Enter your password"
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
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>


                {message && (

                    <p className="error-message">
                        {message}
                    </p>

                )}


                <p className="switch-text">

                    Don't have an account?

                    <button
                        type="button"
                        className="link-btn"
                        onClick={onRegister}
                    >
                        Register
                    </button>

                </p>

            </div>

        </div>
    );
}


export default Login;