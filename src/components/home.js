import React from "react";
import "../App.css";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = () => {
	const navigate = useNavigate();
	const [RoomID, setRoomID] = useState("");
	const [username, setUsername] = useState('')
	const createnNewRoom = (e) => {
		e.preventDefault();
		const id = uuidv4();
		setRoomID(id);
		toast.success('Created a new Room')
	};
	const joinRoom = (e) => {
		if (!RoomID || !username) {
			toast.error("ROOM ID & Username is required");
			return;
		}
		// redirect 
		navigate(`/editor/${RoomID}`, {
			state: {
				username,
			}
		})
	}
	const handleInputEnter = (e) => {
		if (e.code === 'Enter') {

			joinRoom();
		}
	}
	return (
		<>
			<div className="homepagewrapper">
				<div className="formwrappper">
					<img src="/Code-Sync.png" alt="logo" className="logooo" />
					<h4 className="mainlabel">Paste invitation ROOM ID</h4>
					<div className="inputGroup">
						<input
							type="text"
							value={RoomID}
							onChange={(e) => {
								setRoomID(e.target.value);
							}}
							className="inputBox"
							placeholder="ROOM ID"
							onKeyUp={handleInputEnter}
						/>
						<input
							type="text"
							className="inputBox"
							value={username}
							onChange={(e) => {
								setUsername(e.target.value);
							}}
							placeholder="USERNAME"
							onKeyUp={handleInputEnter}
						/>
						<button onClick={joinRoom} className="btn joinbtn">Join</button>
						<span className="createInfo">
							If you dont have an invite create &nbsp;
							<button
								onClick={createnNewRoom}
								className="btn createNewBtn"
							>
								New Room
							</button>
						</span>
					</div>
				</div>
				<footer>
					Built by Aryan &nbsp;
					<a className="foot" href="https://github.com/" target={"_blank"}>
						Coder
					</a>
				</footer>
			</div>
		</>
	);
};

export default Home;
