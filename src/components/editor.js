import React from "react";
import { useState, useRef, useEffect } from "react";
import toast from 'react-hot-toast';
import ACTIONS from "../actions";
import Client from "../clients/clients";
import Editorpage from "../clients/editorpage";
import { initSocket } from "../socket";
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';

const Editor = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  useEffect(() => {
    const y = 0;
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));
      function handleErrors(e) {
        console.log('socket error', e);
        toast.error('Socket connection failed try again later.');
        reactNavigator('/');
      }
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });
      //Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId
          });
        }
      );
      //listening for disconnected
      socketRef.current.on(
        ACTIONS.DISCONNECTED,
        ({ socketId, username }) => {
          toast.success(`${username} left the room.`);
          setClients((prev) => {
            return prev.filter(
              (client) => client.socketId !== socketId
            );
          })
        }
      )

    }
    init();
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    }
  }, [])
  const [clients, setClients] = useState([
    { socketId: 1, username: 'Adinend' }
  ])

  async function copyroom() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been Copied to your clipboard')
    } catch (err) {
      toast.error('could not copy the Room ID')
      console.log(err)
    }
  }
  async function leaveroom() {
    reactNavigator('/')

  }
  if (!location.state) {
    return <Navigate to="/" />
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img src="/Code-Sync.png" alt="logo" style={{ height: "150px" }} />
          </div>
          <h3> Connected </h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copybtn" onClick={copyroom}>Copy Room</button>
        <button className="btn leavebtn" onClick={leaveroom}>Leave Room</button>
      </div>
      <div className="editorWrapper">
        <Editorpage socketRef={socketRef} roomId={roomId} onCodeChange={(code) => {
          codeRef.current = code
        }} />
      </div>
    </div>
  );
};

export default Editor;
