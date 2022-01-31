import { useRef, useContext } from "react";
import validator from "validator";
import { v4 as uuidv4 } from "uuid";
import Context from "../../context";
import { auth, realTimeDb } from "../../firebase";

const SignUp = (props) => {
  const { toggleModal } = props;

  const fullnameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const { cometChat, setIsLoading } = useContext(Context);

  const getInputs = () => {
    const fullname = fullnameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;
    return { fullname, email, password, confirmPassword };
  };

  const isSignupValid = ({ fullname, email, password, confirmPassword }) => {
    if (validator.isEmpty(fullname)) {
      alert("Please input your fullname");
      return false;
    }
    if (!validator.isEmail(email)) {
      alert("Please input your email");
      return false;
    }
    if (validator.isEmpty(password) || !validator.isLength(password, { min: 6 })) {
      alert("Please input your password. You password must have at least 6 characters");
      return false;
    }
    if (validator.isEmpty(confirmPassword)) {
      alert("Please input your confirm password");
      return false;
    }
    if (password !== confirmPassword) {
      alert("Confirm password and password must be the same");
      return false;
    }
    return true;
  };

  const generateAvatar = () => {
    const avatars = [
      'https://data-us.cometchat.io/assets/images/avatars/captainamerica.png',
      'https://data-us.cometchat.io/assets/images/avatars/cyclops.png',
      'https://data-us.cometchat.io/assets/images/avatars/ironman.png',
      'https://data-us.cometchat.io/assets/images/avatars/spiderman.png',
      'https://data-us.cometchat.io/assets/images/avatars/wolverine.png'
    ];
    const avatarPosition = Math.floor(Math.random() * avatars.length);
    return avatars[avatarPosition];
  };

  const createAccount = ({ userUuid, fullname, email, userAvatar }) => {
    return { id: userUuid, fullname, email, avatar: userAvatar }
  };

  const createCometChatAccount = ({ userUuid, fullname, userAvatar }) => {
    const authKey = `${process.env.REACT_APP_COMETCHAT_AUTH_KEY}`;
    const user = new cometChat.User(userUuid);
    user.setName(fullname);
    user.setAvatar(userAvatar);
    cometChat.createUser(user, authKey).then(
      user => {
        setIsLoading(false);
      }, error => {
        setIsLoading(false);
      }
    )
  };

  const signup = () => {
    const { fullname, email, password, confirmPassword } = getInputs();
    if (isSignupValid({ fullname, email, password, confirmPassword })) {
      setIsLoading(true);
      const userUuid = uuidv4();
      const userAvatar = generateAvatar();
      auth.createUserWithEmailAndPassword(email, password).then((userCrendentials) => {
        if (userCrendentials) {
          const createdAccount = createAccount({ userUuid, fullname, email, userAvatar });
          realTimeDb.ref(`users/${userUuid}`).set(createdAccount).then(() => {
            alert(`${email} was created successfully! Please sign in with your created account`);
            createCometChatAccount({ userUuid, fullname, userAvatar });
            toggleModal(false);
          });
        }
      }).catch((error) => {
        setIsLoading(false);
        alert(`Cannot create your account, ${email} might be existed, please try again!`);
      });
    }
  };

  return (
    <div className="signup">
      <div className="signup__content">
        <div className="signup__container">
          <div className="signup__title">Sign Up</div>
          <div className="signup__close">
            <svg 
              style={{ color: "#FFF", fontWeight: 'bold', height: '1rem', width: '1rem', marginRight: '0.5rem'}}
              alt="close"
              onClick={() => toggleModal(false)} xmlns="http://www.w3.org/2000/svg" height="329pt" viewBox="0 0 329.26933 329" width="329pt"><path d="m194.800781 164.769531 128.210938-128.214843c8.34375-8.339844 8.34375-21.824219 0-30.164063-8.339844-8.339844-21.824219-8.339844-30.164063 0l-128.214844 128.214844-128.210937-128.214844c-8.34375-8.339844-21.824219-8.339844-30.164063 0-8.34375 8.339844-8.34375 21.824219 0 30.164063l128.210938 128.214843-128.210938 128.214844c-8.34375 8.339844-8.34375 21.824219 0 30.164063 4.15625 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921875-2.089844 15.082031-6.25l128.210937-128.214844 128.214844 128.214844c4.160156 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921874-2.089844 15.082031-6.25 8.34375-8.339844 8.34375-21.824219 0-30.164063zm0 0"/></svg>
            {/* <img
              alt="close"
              onClick={() => toggleModal(false)}
              src="https://www.svgrepo.com/download/201567/cross.svg"
            /> */}
          </div>
        </div>
        <div className="signup__subtitle"></div>
        <div className="signup__form">
          <input type="text" placeholder="Fullname" ref={fullnameRef} />
          <input type="text" placeholder="Email" ref={emailRef} />
          <input type="password" placeholder="Password" ref={passwordRef} />
          <input
            type="password"
            placeholder="Confirm Password"
            ref={confirmPasswordRef}
          />
          <button className="signup__btn" onClick={signup}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
