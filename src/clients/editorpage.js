import React from 'react'
import { useEffect, useRef } from 'react'
import CodeMirror from 'codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/theme/dracula.css'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/lib/codemirror.css'
import ACTIONS from '../actions'


const Editorpage = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  useEffect(() => {

    async function init() {
      editorRef.current = CodeMirror.fromTextArea(document.getElementById('realtimeeditor'), {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });
      editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;

        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== 'setValue') {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          })
        }
        // console.log(code);
      })
    }
    init();

  }, [])
  useEffect(() => {
    if (socketRef.current) {
      //listening code change
      console.log('swdadad')
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code, roomId }) => {
        // console.log(code);
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      })
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    }
  }, [socketRef.current])

  return <textarea id='realtimeeditor'></textarea>
}

export default Editorpage