import React, { useState, useEffect } from "react";

import 'bootstrap/dist/css/bootstrap.min.css';
import './lobby_chat.css';

import Container from 'react-bootstrap/Container';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import Form from 'react-bootstrap/Form';
import { useHistory } from "react-router-dom";

import io from "socket.io-client";
//Deploy
const ENDPOINT = window.location.hostname;
//Local
//const ENDPOINT = "http://127.0.0.1:4001/";
const socket = io(ENDPOINT);

function Lobby(props) {
    const [urlPath, setUrlPath] = useState("");
    const history = useHistory();
    const [randomItem, setRandomItem] = useState("");
    const [success, setSuccess] = useState(false);
    const [userName, setUsername] = useState("");
    const [adminName, setAdminName] = useState("");
    const [lobby, setLobby] = useState("");
    const [playerJoined, setPlayerJoined] = useState("");
    const [winner, setWinner] = useState("");
    const [players, setPlayers] = useState([]);
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [refreshButtonDisabled, setRefreshButtonDisabled] = useState("");
    const [copySuccess, setCopySuccess] = useState("");
    const [redirection, setRedirection] = useState(false);
    // 
    const [rounds, setRounds] = useState("10");
    const [difficulty, setDifficulty] = useState("3");
    const [difficulty_err, setDifficulty_err] = useState("");
    const [flag, setFlag] = useState("");
    const [minPlayersErr, setMinPlayersErr] = useState("");
    const [inGame, setInGame] = useState(false);


    function handlePlayClick() {
      //history.push("/game?lobby="+lobby, {userName: userName});
      socket.emit("startGame", { room: lobby,name: userName, players: players });
    }

    const copyToClipboard = () => {
      navigator.clipboard.writeText(urlPath);
      setCopySuccess("Copied!");
    };

    const leaveGame = () => {
      let currentPlayer = JSON.parse(localStorage.getItem('userInfo'));
      socket.emit("leaveGame", { id: currentPlayer.id});
      history.push("/");
    };

    useEffect(() => {}, [success]);

    useEffect(() => {
      if(props.location.state.userName){
      setUsername(props.location.state.userName);
      }
      let queryString = window.location.search;
      queryString = queryString.concat(window.location.hash);
      const urlParams = new URLSearchParams(queryString);
      const lobbyValue = urlParams.get("lobby");
  
      if (lobbyValue) setLobby(lobbyValue);

      // urlpath
      if(urlPath == "" && localStorage.getItem('inviteUrl') != ""){
        setUrlPath(localStorage.getItem('inviteUrl'));
      }

      if(lobbyValue == null && localStorage.getItem('lobby') !== null){
        setLobby(localStorage.getItem('lobby'));
      }
  
      let url = window.location.href;
      socket.on("newGame", function(data) {
        let url = props.location.state.url;
        if (url.indexOf("?") > -1) {
          url += "&lobby=" + data.room;
        } else {
          url += "?lobby=" + data.room;
        }
        localStorage.removeItem('inviteUrl');
        localStorage.setItem('inviteUrl', url);
        setUrlPath(url);
        setLobby(data.room);
        setPlayerJoined(true);
        localStorage.removeItem('userInfo');
      });
  
      socket.on("addPlayer", function(data) {
        console.log("addPlayers", data)
        if(data.inGame == true){
          setRedirection(true);
          setInGame(true)
        }
        let player = {};
        player.name = data.currentPlayer.name;
        player.id = data.currentPlayer.id;
        player.score = 0;
        setPlayers(data.allPlayers);
        setAdminName(data.allPlayers[0].name)
        if(data.currentPlayer.id == data.allPlayers[0].id){
          setButtonDisabled(false)
        }

        // userInfo localstorage
        if(localStorage.getItem('userInfo') === null){
          localStorage.setItem('userInfo', JSON.stringify(player));
        }
        if(data.inviteUrl != undefined){
          localStorage.setItem('inviteUrl', data.inviteUrl);
        }

      });
  
      socket.on("removePlayer", function(data) {
        console.log("remove player", data);
        socket.emit("leaveGame", { id: data.id});
        let filteredArray = players.filter(item => item.id !== data.id);
        //setPlayers(filteredArray);
      });

      socket.on("startGameRes", function(data) {
        if(data.room && data.name && data.err == null){
          setRedirection(true)
        }else{
          setMinPlayersErr(data.err);
        }
      });

      socket.on("onGetLobbyValues", function(data){
        if(data != null){
          setRounds(data.rounds);
          setDifficulty(data.difficulty)
        }
      });

      console.log("totalRounds", rounds);
      if(redirection == true ){
        history.push("/game?lobby="+lobby, {userName: userName, totalRounds: rounds, players: players, difficulty:difficulty});
      }

    }, [players, redirection]);

    useEffect(() => {
        if(props.location.state.action == "create" && localStorage.getItem('userInfo') === null){  
        socket.emit("createGame", { name: props.location.state.userName});
        }
        if(props.location.state.action == "join" && localStorage.getItem('userInfo') === null){
            //localStorage.removeItem('inviteUrl');
            let queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            let lobbyParam = urlParams.get("lobby");
            // 
            socket.emit("joinGame", { room: lobbyParam, name: props.location.state.userName, inviteUrl: props.location.state.url });
            setUrlPath(props.location.state.url);
            setPlayerJoined(true);
            setFlag(true);
        }
        
        
        socket.on("setLobbyValues", function(data){
          setRounds(data.rounds);
          setDifficulty(data.difficulty)
        });


    }, []);

    const buttonClick = (e) => {
      setDifficulty(e.target.value);
    };

    // useEffect(() => {
    //   if(inGame == true){
    //     let getRounds;
    //     let getDifficulty;
    //     socket.on("onGetLobbyValues", function(data){
    //       if(data != null){
    //         // setRounds(data.rounds);
    //         // setDifficulty(data.difficulty)
    //         getRounds = data.rounds;
    //         getDifficulty = data.difficulty;
    //         console.log("getRounds1",data.rounds)
    //         console.log("getDifficulty1",data.difficulty)
    //       }
    //     });
    //     console.log("getRounds",getRounds)
    //     console.log("getDifficulty",getDifficulty)
    //     if(getRounds != undefined){
    //       history.push("/game?lobby="+lobby, {userName: userName, totalRounds: getRounds, players: players, difficulty:getDifficulty});
    //     }
    //   }
    // }, [inGame]);

    useEffect(() => {
      if(lobby){
        if(flag){
          socket.emit("getLobbyValues", {room: lobby})
        }else{
          socket.emit("LobbyValues", {room: lobby, difficulty:difficulty, rounds:rounds})
        }
      }
    }, [lobby, difficulty, rounds, flag]);


    useEffect(() => {
      console.log("lobby", lobby);
      let getLobby = localStorage.getItem('lobby');
      //if(lobby && getLobby === null){
      if(lobby){
        localStorage.setItem('lobby', lobby);
      }
      if(lobby && lobby != ""){
        socket.emit("getPlayers_lobby", { room: lobby});
      }
      //setPlayers([]);
      socket.on("onGetPlayers_lobby", function(data) {
          console.log("onGetPlayers_lobby",data);
          // if(data.players[0].inGame == true){
          //   setInGame(true)
          // }
          if(data.players.length > 0){
            setPlayers(data.players);
            setAdminName(data.players[0].name)
            let currentPlayer = JSON.parse(localStorage.getItem('userInfo'));
            if(currentPlayer.id == data.players[0].id){
              setButtonDisabled(false)
            }

            // 
            let user = JSON.parse(localStorage.getItem('userInfo'));
            let remove = 0;
            data.players.forEach(function(item, i){
                if(item.id == user.id){
                    remove++;
                } 
            });
            if(remove == 0){
              history.push("/");
            }
            // 
          }
      });
      

    }, [lobby]);

    return (
    <Container className="p-3" >
    <Jumbotron className="text-center">
      <h2>Gran Lince!</h2>
    </Jumbotron>
    <Container className="text-center">
      <Row className="main_section">
        <Col className="p-0 pr-1">
          <Card fluid="true">
              <Card.Header className="text-left"><h5>{adminName}'s Private Lobby</h5></Card.Header>
                <ListGroup className="list-group-flush">
                <ListGroupItem>
                    <Form className="text-left">
                        <Form.Label><b>Rounds</b></Form.Label>
                        <Form.Group>
                            <Form.Control as="select" onChange={event => setRounds(event.target.value)} disabled={buttonDisabled}>
                                <option selected={rounds == 10}>10</option>
                                <option selected={rounds == 20}>20</option>
                                <option selected={rounds == 30}>30</option>
                                <option selected={rounds == 40}>40</option>
                                <option selected={rounds == 50}>50</option>
                                <option selected={rounds == 60}>60</option>
                                <option selected={rounds == 70}>70</option>
                                <option selected={rounds == 80}>80</option>
                                <option selected={rounds == 90}>90</option>
                                <option selected={rounds == 100}>100</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </ListGroupItem>
                <ListGroupItem className="lobby_difficulty text-left">
                    <b> Difficulty </b>
                    <ListGroup horizontal>
                        <ListGroup.Item><Button variant={difficulty == 1 ? "success btn-block btn-lg" : "outline-success btn-block btn-lg" } value="1" onClick={buttonClick} disabled={buttonDisabled}>Easy</Button></ListGroup.Item>
                        <ListGroup.Item><Button variant={difficulty == 2 ? "warning btn-block btn-lg" : "outline-warning btn-block btn-lg" } value="2" onClick={buttonClick} disabled={buttonDisabled}>Medium</Button></ListGroup.Item>
                        <ListGroup.Item><Button variant={difficulty == 3 ? "danger btn-block btn-lg" : "outline-danger btn-block btn-lg" } value="3" onClick={buttonClick} disabled={buttonDisabled}>Hard</Button></ListGroup.Item>
                        {/* <ListGroup.Item><Button variant={difficulty == 3 ? "danger" : "outline-danger" } onClick={event => setDifficulty("3")}>Hard</Button></ListGroup.Item> */}
                    </ListGroup>
                </ListGroupItem>
                <ListGroupItem>
                <Button variant="success" size="lg" block onClick={handlePlayClick} disabled={buttonDisabled}>
                  Start Game!
                </Button>
                {minPlayersErr && <div class="alert alert-warning mt-2">  
                    <strong>Oops!</strong> {minPlayersErr}  
                </div> }
                </ListGroupItem>
                <ListGroupItem>
                {urlPath ? (
                    <span>
                      <input type="text" style={{width:'100%', marginBottom:10}} value={urlPath} readOnly />
                      <Button variant="secondary" size="lg" block onClick={copyToClipboard}>
                        Invite
                      </Button>
                      {copySuccess}
                      <Button variant="secondary" size="lg" block onClick={leaveGame}>
                        Leave Game
                      </Button>
                    </span>
                  ) : (
                    <span></span>
                  )}
                </ListGroupItem>
                
              </ListGroup>
            
          </Card>
        </Col>
        <Col className="p-0 pl-1">
          <Card fluid="true">
              <Card.Header className="text-left"><h5>Players Joined</h5></Card.Header>
              <Card.Body>
                <ListGroup>
                      {players.map((person, index) => (
                          <ListGroupItem key={person.id}>
                          <Button variant="primary" size="sm" block>
                          {person.name}
                          </Button>
                        </ListGroupItem>
                      ))}
                </ListGroup>
              </Card.Body>
          </Card>
          {/* {inGame && <div class="alert alert-warning mt-2">  
                    <strong>Oops! The Game already start. Please wait in lobby until they complete the game</strong>
                </div> } */}
        </Col>
      </Row>
     
    </Container>
  </Container>
    );
  }

export default Lobby;