import { useRef, useState } from "react";
import style from "./Signup.module.css";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import rolling from "../assets/rolling.gif";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
const Login = () => {
  const [error, setError] = useState({});
  const [fetching, setFetching] = useState(false);

  const password = useRef();
  const email = useRef();

  const { setUser } = useAuthContext();

  const [hidden, setHidden] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (email.current.value === "") {
      setError({ index: 1, error: "Enter your email" });
      return;
    }
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email.current.value)) {
      setError({ index: 1, error: "Enter a proper email" });
      return;
    }
    if (password.current.value === "") {
      setError({ index: 2, error: "Enter your password" });
      return;
    }
    const regex2 =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!regex2.test(password.current.value)) {
      setError({
        index: 2,
        error:
          "The password should have one small letter,one capital letter, one special character and 8 letter long",
      });
      return;
    }
    setFetching(true);
    const data = await fetch("http://localhost:8000/auth/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: email.current.value,
        password: password.current.value,
      }),
    });
    setFetching(false);
    const json = await data.json();
    if (!data.ok) {
      setError(json);
      return;
    }
    setUser(json);
  };

  return (
    <>
      <div className={style.auth}>
        <div className={style.authContainer}>
          <form action="" className={style.authForm} onSubmit={handleSubmit}>
            <div className={style.authTitle}>
              Welcome back, login the connect
            </div>
            <div className={style.link}>
              Don't have an account link?{" "}
              <Link className={style.link2} to="/signup">
                {" "}
                Sign up
              </Link>
            </div>
            <div className={style.inputWrapper}>
              <div className={error && error.index === 1 ? style.error : ""}>
                {error && error.index === 1 && error.error}
              </div>
              <input
                ref={email}
                placeholder="Your email"
                type="text"
                className={`${style.input} ${
                  error && error.index === 1 ? style.errorInput : ""
                }`}
              />
            </div>
            <div className={style.inputWrapper}>
              <div className={error && error.index === 2 ? style.error : ""}>
                {error && error.index === 2 && error.error}
              </div>
              <label htmlFor="password"
                className={`${style.input} ${
                  error && error.index === 3 ? style.errorInput : ""
                }`}
              >
                <input
                  ref={password}
                  placeholder="Set a password"
                  id="password"
                  type={hidden ? "password" : "text"}
                />
                {hidden ? (
                  <IoEyeOutline
                    onClick={() => setHidden(false)}
                    className={style.eye}
                  />
                ) : (
                  <IoEyeOffOutline
                    onClick={() => setHidden(true)}
                    className={style.eye}
                  />
                )}
              </label>
            </div>
            <button disabled={fetching} className={style.submit}>
              Create Account
              {fetching && (
                <img className={style.rolling} src={rolling} alt="" />
              )}
            </button>
          </form>
        </div>
        <div className={style.authContainer}>
          <div className={style.carousel}></div>
        </div>
      </div>
    </>
  );
};

export default Login;
