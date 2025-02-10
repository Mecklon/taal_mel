import style from "./Signup.module.css";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import rolling from "../assets/rolling.gif";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
import loading from "../assets/loading2.svg";

const Signup = () => {
  const { setUser } = useAuthContext();

  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);

  const [hidden, setHidden] = useState(true);
  const [verify, setVerify] = useState(false);

  const name = useRef();
  const email = useRef();
  const password = useRef();

  const otpEmail = useRef();
  const otpPassword = useRef();
  const otpName = useRef();

  useEffect(() => {
    if (!verify) return;
    const lists = document.querySelectorAll(`.${style.optInput}`);
    lists.forEach((item) => (item.value = ""));
  }, [verify]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (name.current.value.trim() === "") {
      setError({ index: 1, error: "Enter your name" });
      return;
    }
    if (email.current.value.trim() === "") {
      setError({ index: 2, error: "Enter your email" });
      return;
    }
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email.current.value)) {
      setError({ index: 2, error: "Enter a proper email" });
      return;
    }
    if (password.current.value.trim() === "") {
      setError({ index: 3, error: "Enter your password" });
      return;
    }
    const regex2 =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!regex2.test(password.current.value)) {
      setError({
        index: 3,
        error:
          "The password should have one small letter,one capital letter, one special character and 8 letter long",
      });
      return;
    }
    setFetching(true);
    const data = await fetch("http://localhost:8000/auth/signup", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: email.current.value.trim(),
      }),
    });
    setFetching(false);

    const json = await data.json();

    if (!data.ok) {
      setError(json);
      return;
    }
    otpEmail.current = email.current.value.trim();
    otpPassword.current = password.current.value.trim();
    otpName.current = name.current.value.trim();
    setVerify(true);
    name.current.value = "";
    password.current.value = "";
    email.current.value = "";
  };

  const handleOtpChange = async (e, index) => {
    const inputValue = e.target.value;
    if (inputValue.match(/^[0-9]$/)) {
      if (index < 5) {
        document.querySelectorAll(`.${style.otpInput}`)[index + 1].focus();
      } else {
        const otp = Array.from(document.querySelectorAll(`.${style.otpInput}`))
          .map((input) => input.value)
          .join("");
        setFetching(true)
        const data = await fetch("http://localhost:8000/auth/verifyOtp", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: otpEmail.current,
            otp,
            name: otpName.current,
            password: otpPassword.current
          }),
        });
        const json = await data.json();
        setFetching(false)
        if (!data.ok) {
          document
            .querySelectorAll(`.${style.otpInput}`)
            .forEach((input) => (input.value = ""));
          setError(json.error);
          return;
        }
        setUser(json); 
      }
    } else {
      e.target.value = "";
    }
  };

  const handleOtpInputClick = (index) => {
    const otpInputs = document.querySelectorAll(`.${style.otpInput}`);
    for (let i = 0; i < otpInputs.length; i++) {
      if (!otpInputs[i].value) {
        otpInputs[i].focus();
        break;
      }
    }
  };

  return (
    <>
      <div className={style.auth}>
        <div className={style.authContainer}>
          <div className={style.carousel}>lcad</div>
        </div>
        <div className={style.authContainer}>
          {!verify ? (
            <form action="" className={style.authForm} onSubmit={handleSubmit}>
              <div className={style.authTitle}>Create an account</div>
              <div className={style.link}>
                Already have an account?{" "}
                <Link className={style.link2} to="/login">
                  {" "}
                  Log in
                </Link>
              </div>
              <div className={style.inputWrapper}>
                <div className={error && error.index === 1 ? style.error : ""}>
                  {error && error.index === 1 && error.error}
                </div>
                <input
                  ref={name}
                  placeholder="Your Name"
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
                <input
                  ref={email}
                  placeholder="Email"
                  type="text"
                  className={`${style.input} ${
                    error && error.index === 2 ? style.errorInput : ""
                  }`}
                />
              </div>
              <div className={style.inputWrapper}>
                <div className={error && error.index === 3 ? style.error : ""}>
                  {error && error.index === 3 && error.error}
                </div>
                <label
                  htmlFor="password"
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
          ) : (
            <form className={style.otpWrapper}>
              <div className={style.otpEmail}>
                A verification otp was sent to {otpEmail.current}
              </div>
              <div className={style.otpHeader}>Enter the otp:</div>
              <div className={style.otpInputWrapper}>
                <input
                  type="text"
                  className={style.otpInput}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(e, 0)}
                  onClick={() => handleOtpInputClick(0)}
                />
                <input
                  type="text"
                  className={style.otpInput}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(e, 1)}
                  onClick={() => handleOtpInputClick(1)}
                />
                <input
                  type="text"
                  className={style.otpInput}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(e, 2)}
                  onClick={() => handleOtpInputClick(2)}
                />
                <input
                  type="text"
                  className={style.otpInput}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(e, 3)}
                  onClick={() => handleOtpInputClick(3)}
                />
                <input
                  type="text"
                  className={style.otpInput}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(e, 4)}
                  onClick={() => handleOtpInputClick(4)}
                />
                <input
                  type="text"
                  className={style.otpInput}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(e, 5)}
                  onClick={() => handleOtpInputClick(5)}
                />
              </div>
              {fetching && (
                <img src={loading} className={style.otpLoader} alt="" />
              )}
              {error && <div className={style.otpError}>{error}</div>}
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Signup;
