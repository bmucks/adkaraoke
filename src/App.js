import './App.css';
import React, { useState, useEffect, useRef } from "react";
import firebase from "./firebase.js";
import "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

function App() {
  const [songs, setSongs] = useState([]);
  const [originalSongs, setOriginalSongs] = useState([]);
  const [name, setName] = useState([]);
  const [cardNotes, setCardNotes] = useState([]);
  const [stor, setStor] = useState([]);
  const [songTitle, setSongTitle] = useState([]);
  const [artist, setArtist] = useState([]);
  const [notes, setNotes] = useState([]);
  const [style, setStyle] = useState(false);
  const [disBut, setDisBut] = useState(false);
  const [id, setId] = useState([]);
  const [agree, setAgree] = useState("");
  const [checked, setChecked] = useState(false);
  const [isOriginalOrder, setIsOriginalOrder] = useState(true);
  const ref = firebase.firestore().collection("songs");
  const lastCopiedButtonRef = useRef(null);
  const longPressTimeoutRef = useRef(null);

  useEffect(() => {
    ref.orderBy('createdAt', 'desc').onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data());
      });
      setSongs(items);
      setOriginalSongs(items);
    });
  }, []);

  function addSong(newSong) {
    if (newSong.name.length < 2 || newSong.songTitle.length < 2 || newSong.artist.length < 2) {
      alert('Entries must be greater than 1 character');
    } else if (disBut === true) {
      alert('Please wait 30 seconds before requesting another song. Please no more than 2-3 requests per person on queue at a time');
    } else {
      setDisBut(true);
      setTimeout(() => setDisBut(false), 20000);
      ref.doc(newSong.id)
        .set(newSong)
        .catch((err) => {
          console.error(err);
        });
      alert('Request has been submitted and received by Miah and/or Mucks');
      setSongTitle(['']);
    }
  }

  function deleteSong(song) {
    ref.doc(song.id)
      .delete()
      .then(() => {
        // Update the state to remove the deleted song
        setSongs(songs.filter(s => s.id !== song.id));
      })
      .catch((err) => {
        console.error('Error deleting song: ', err);
      });
  }

  function changeSong(song) {
    ref.doc(song.id)
      .update({ check: (!song.check) })
      .catch((err) => {
        console.error(err);
      });
    ref.orderBy('createdAt', 'desc').onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data());
      });
      setSongs(items);
      setOriginalSongs(items);
    });
  }

  function addCardNotes(song, cardNotes) {
    console.log(cardNotes);
    ref.doc(song.id)
      .update({ cardNote: cardNotes })
      .catch((err) => {
        console.error(err);
      });
    ref.orderBy('createdAt', 'desc').onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data());
      });
      setSongs(items);
      setOriginalSongs(items);
    });
  }

  function adminP() {
    setStyle(true);
    ref.orderBy('createdAt', 'desc').onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data());
      });
      setSongs(items);
      setOriginalSongs(items) ;
    });
  }

  function moveSong(index, direction, spots = 1) {
    const items = Array.from(songs);
    const [movedItem] = items.splice(index, 1);
    const newIndex = direction === 'up' ? Math.max(index - spots, 0) : Math.min(index + spots, items.length);
    items.splice(newIndex, 0, movedItem);
    setSongs(items);
  }

  function handleLongPress(index, direction) {
    longPressTimeoutRef.current = setTimeout(() => {
      const spots = parseInt(prompt(`How many spots would you like to move the song ${direction}?`), 10);
      if (!isNaN(spots) && spots > 0) {
        moveSong(index, direction, spots);
      }
    }, 1000);
  }

  function handleMouseUp() {
    clearTimeout(longPressTimeoutRef.current);
  }

  function copyToClipboard(text, event) {
    navigator.clipboard.writeText(text).then(() => {
      if (lastCopiedButtonRef.current) {
        lastCopiedButtonRef.current.classList.remove('copied');
      }
      event.target.classList.add('copied');
      lastCopiedButtonRef.current = event.target;
    });
  }



  return (
    <div className="App">
      <h1> Mr.Goodbar Karaoke 2025</h1>
      <div className="info">

        <br />
        <img height="300px" src="https://i.redd.it/13jrgfe7tjy71.jpg" alt="new" />
        <img height="300px" src="https://static.simpsonswiki.com/images/2/2e/The_Be_Sharps.png" alt="new" />
        <img height="300px" src="https://i.gifer.com/6fLK.gif" alt="new" />
        <br></br> 
        <button className="adminBut" type="reset" defaultValue="Reset" onClick={() => adminP()} >
          A-Googily-Doogily...
        </button>
      
        <div className="container">
          <div className="songgrid">
            {songs.map((song, index) => (
              <div key={song.id} className="songcard">
                <div className="song-number">{songs.length - index - 1}</div>
                <div className="delete-button" onClick={() => deleteSong(song)}>x</div>
                <div className="songcard-content">
          
                  <h2>Singer Name: {song.name} <button className="copy-button" onClick={(e) => copyToClipboard(song.name, e)}>Copy</button></h2>
              
                </div>
                <div className="songcard-content">
                  <h2>Artist: {song.artist} <button className="copy-button" onClick={(e) => copyToClipboard(song.artist, e)}>Copy</button></h2>
                </div>
                <div className="songcard-content">
                  <h2>Song: {song.songTitle} <button className="copy-button" onClick={(e) => copyToClipboard(song.songTitle, e)}>Copy</button></h2>
                </div>
                <h2>Singer Notes: {song.notes}</h2>
                <input type="checkbox" onChange={(e) => changeSong(song)} checked={song.check} />
                <h2>{moment(song.createdAt.toDate()).calendar()}</h2>
                <form>
                  <textarea className="djNotes"></textarea>
                </form>
                <br></br>
              </div>
            ))}
          </div>
          <div className="textbox-container">
            <textarea className="sidenote" type="text" placeholder="Notes" name="name" onChange={(e) => notes(e.target.value)} />
          </div>
        </div>
        <br></br>
      </div>
      <br></br>
      <br></br>
      <div></div>
    </div>
  );
}

export default App;