import { NavLink, useNavigate } from "react-router-dom";
import { resetPassword, signIn, signUp } from "../utils/AuthManipulations";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import InvalidFeedback from "../components/InvalidFeedback";
import { useEffect, useState, useRef } from "react";
import SuccessAlert from "../components/SuccessAlert";
import Required from "../components/Required";
import ErrorAlert from "../components/ErrorAlert";
export default function Login({ isSignUp }) {
	return (
		<>
			<div className="login-background"></div>
			<div className="login-container">
				<LoginForm isSignUp={isSignUp} />
			</div>
		</>
	);
}

function LoginForm({ isSignUp }) {
	const navigate = useNavigate();
	const emailInput = useRef(null);
	const passwordInput = useRef(null);
	const [form, setForm] = useState({
		email: "",
		password: "",
		name: "",
		rememberMe: false,
	}); //form data
	const [error, setError] = useState(null);
	const errors = {
		"auth/email-already-in-use": "This email is already in use",
		"auth/invalid-login-credentials": "Invalid login credentials",
		
	};
	const [message, setMessage] = useState(null); //message to show after password reset

	//validation
	function isLoginInfoValid() {
		return isEmailCorrect() && isPasswordCorrect();
	}

	function isEmailCorrect() {
		return form.email.includes("@");
	}
	function isPasswordCorrect() {
		return isSignUp ? form.password.match(/(?=.*\d)(?=.*[a-z]).{8,}/g) : true;
	}

	useEffect(() => {
		const auth = getAuth();
		onAuthStateChanged(auth, (user) => {
			if (user) {
				//console.log(user);
				navigate("/");
				// ...
			} else {
				// User is signed out
			}
		});
	});
	useEffect(() => {
		setForm({
			email: "",
			password: "",
			name: "",
			rememberMe: false,
		});
		setError(null);
	}, [isSignUp]);


	function handleSubmit(e) {
		e.preventDefault();
		if (isLoginInfoValid()) {
			isSignUp
				? signUp(form.email, form.password, form.name, setError)
				: signIn(form.email, form.password, setError);
		} else {
			//showing invalid feedback if inputs data is invalid (unrecognized email and wrong password)
			if (!isPasswordCorrect()) {
				passwordInput.current.classList.add("is-invalid");
			}
			if (!isEmailCorrect()) {
				emailInput.current.classList.add("is-invalid");
			}
		}
	}

	function handlePasswordReset(e) {
	//console.log("reset password");
		if (form.email && isEmailCorrect())
			resetPassword(form.email, setError, setMessage);
		else {
			setMessage({type: "error", text: "Enter a valid email to get a password reset link"});
		}
	}

	return (
		<form id="login-form" className="login-form" onSubmit={handleSubmit}>
			<h1 className="login-title">Outfit Generator</h1>
			<h2 className="login-sub-title">{isSignUp ? "Sign up" : "Sign in"}</h2>
			{isSignUp && 
			<div className="row">
				<div className="col-12">
					<label htmlFor="name-input" className="form-label">
						Display name
					</label>
					<input
						type="text"
						id="name-input"
						className={"form-control form-input " + (error ? "is-invalid" : "")}
						placeholder="Enter your name or create username"
						ref={emailInput}
						autoComplete="username"
						onChange={(e) => {
							setForm({ ...form, name: e.target.value });
							setMessage(null);
							e.target.classList.remove("is-invalid");
						}}
						value={form.name}
					/>
				</div>
			</div>}
			<div className="row">
				<div className="col-12">
					<label htmlFor="email-input" className="form-label">
						Email <Required/>
					</label>
					<input
						type="email"
						id="email-input"
						className={"form-control form-input " + (error ? "is-invalid" : "")}
						placeholder="Enter your email"
						required
						ref={emailInput}
						autoComplete="email"
						onChange={(e) => {
							setForm({ ...form, email: e.target.value });
							setMessage(null);
							e.target.classList.remove("is-invalid");
						}}
						value={form.email}
					/>
					{error && <InvalidFeedback>{errors[error.code]}</InvalidFeedback>}
				</div>
			</div>
			<div className="row">
				<div className="col-12">
					<label htmlFor="password-input" className="form-label">
						Password <Required/>
					</label>
					<input
						type="password"
						id="password-input"
						className={
							"form-control form-input " +
							(!isSignUp && error ? "is-invalid" : "")
						}
						placeholder="Enter your password"
						required
						ref={passwordInput}
						value={form.password}
						pattern="(?=.*\d)(?=.*[a-z]).{8,}"
						title="Password must be at least 8 characters long and include at least one number and letter"
						autoComplete={isSignUp? "new-password": "current-password"}
						onChange={(e) => {
							//showing invalid feedback message if password is too short
							setMessage(null);
							setForm({
								...form,
								password: e.target.value,
							});
							e.target.classList.remove("is-invalid");
						}}
					/>

					{error && <InvalidFeedback>{errors[error.code]}</InvalidFeedback>}
				</div>
			</div>
			{/*<div className="row">
                <div className="col-12">
                    <div className="form-check remember-me">
                        <input type="checkbox" id="remember-me" className="form-check-input"
                            onChange={(e) => {
                                setForm({ ...form, rememberMe: e.target.checked })
                            }}
                            checked={form.rememberMe}
                        />
                        <label className="form-check-label" htmlFor="remember-me">
                            Remember me
                        </label>
                    </div>

                </div>
            </div>
                        */}
						<div className="row">
						<div className="col-12">
							<p className="red">* - Required fields</p>
						</div>
					</div>
			<div className="row">
				<div className="col-12 center-alignment">
					<button type="submit" className="button login-btn">
						{isSignUp ? "Sign up" : "Sign in"}
					</button>
					<NavLink to={isSignUp ? "/login" : "/signup"} className={"link"}>
						{isSignUp
							? "Already have an account? Sign in"
							: "Don't have an account? Sign up"}{" "}
					</NavLink>
					{!isSignUp && (
						<NavLink to="#" className={"link"} onClick={handlePasswordReset}>
							Forgot password? Sent reset link
						</NavLink>
					)}
				</div>
			</div>

			{message && 
			(message.type==="success" ? 
			<SuccessAlert>{message.text}</SuccessAlert> :
			<ErrorAlert>{message.text}</ErrorAlert>)
			}
		</form>
	);
}
