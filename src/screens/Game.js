import React, { useState, useEffect } from "react";
import "../styles/game.css";
import { itemsIcons } from "../assets/Assets";
import StartIcon from "../icons/start-icon.png";
import Refresh from "../icons/icons8-refresh-30.png";

function Game() {
  const [items, setItems] = useState(itemsIcons);
  const [randomItem, setRandomItem] = useState("");
  const [success, setSuccess] = useState(false);

  const [players, setPlayers] = useState([
    {
      name: "Nil",
      id: "181237098142",
      score: 0
    },
    {
      name: "Merce",
      id: "fdgg3452",
      score: 0
    }
  ]);
  const [buttonDisabled, setButtonDisabled] = useState("");

  useEffect(() => {}, [success]);

  return (
    <div className="layout">
      <div className=" ">
        <Boardgame
          setSuccess={setSuccess}
          randomItem={randomItem}
          setPlayers={setPlayers}
          players={players}
          success={success}
          setButtonDisabled={setButtonDisabled}
          items={items}
        />
      </div>
      <div className=" block">
        <Item
          setItems={setItems}
          randomItem={randomItem}
          setRandomItem={setRandomItem}
          buttonDisabled={buttonDisabled}
          setButtonDisabled={setButtonDisabled}
          setSuccess={setSuccess}
          success={success}
          items={items}
        />
        <Players players={players} success={success} />
      </div>
    </div>
  );
}

function Item(props) {
  const {
    randomItem,
    setRandomItem,
    buttonDisabled,
    setButtonDisabled,
    setSuccess,
    success,
    setItems,
    items
  } = props;

  const random = () => {
    setSuccess(false);
    setButtonDisabled(true);
    setRandomItem(itemsIcons[Math.floor(Math.random() * itemsIcons.length)]);
  };

  const relocate = () => {
    let copyItems = [...items];
    let array = copyItems;
    console.log("1", array);
    let currentIndex = array.length;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      let temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    setItems(array);
    console.log("2", array);
  };

  return (
    <div>
      <img
        className={!success ? "bigIcon neutral" : "bigIcon correct"}
        src={randomItem ? randomItem : StartIcon}
        alt={randomItem}
      />
      <div>
        <button
          className={buttonDisabled ? "disabled block" : "button block"}
          onClick={random}
          disabled={buttonDisabled}
        >
          New Items
        </button>
        <button
          onClick={relocate}
          className={buttonDisabled ? "refreshDisabled block" : "refresh block"}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

function Players(props) {
  const { players, success } = props;

  return (
    <div className="players">
      {success && <p>Nil won the round</p>}
      {players.map((player, index) => (
        <div key={index} className="player">
          <p>{player.name}</p> <p className="score">Score: {player.score}</p>
        </div>
      ))}
    </div>
  );
}

function Boardgame(props) {
  const {
    setPlayers,
    players,
    setButtonDisabled,
    randomItem,
    setSuccess,
    success,
    items
  } = props;

  const score = item => {
    if (item === randomItem) {
      let playersCopy = [...players];
      playersCopy[0].score = playersCopy[0].score + 1;
      setPlayers(playersCopy);
      setButtonDisabled(false);
      setSuccess(true);
    } else {
      console.log("wrong");
    }
  };

  return (
    <div className="items scroll">
      {items.map((item, index) => (
        <div
          key={index}
          className={
            item === randomItem && success ? "squareGreen square" : "square"
          }
          onClick={() => score(item)}
        >
          <img className="square " src={item} alt={item} />
        </div>
      ))}
    </div>
  );
}

export default Game;
