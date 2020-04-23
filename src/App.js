import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import { Route,  BrowserRouter as Router, useHistory } from 'react-router-dom';
import { Form, Button} from 'semantic-ui-react'
import $ from 'jquery'
import DashBoard from './Dashboard'



function Login( ){
  const history = useHistory();
  
  function verifyUser(event){
      let userid = $('#userid').val() 
      if( userid !== '' ){
        history.push(`${userid}`);
      }
  }
  
    return(
      <Form  style={{ width: '80vw',maxWidth:300+'px', textAlign: 'left',color: 'white'}} onSubmit={verifyUser} >
      
        <h3 style={{ textAlign: 'center',marginTop: '30px' }}> Login </h3> 
        <Form.Group>
        <label style={{ margin:'10px' }}> User Id </label>
        </Form.Group>
        <Form.Input  placeholder='Enter User Id' id="userid" />
        <Button primary floated="right">Login</Button>
        
      </Form>
    )
  }
  

function Title( props){

  return(
    <div className="Title">
     <div className="main_title" >CogniQA</div>
     <div className="tagline"> Diagnose Tool </div>
  </div>
  )
}



class App extends React.Component{
  constructor(props){
    super(props)

    this.state = {username : undefined,userid: undefined }

    const styleLink = document.createElement("link")
    styleLink.rel = "stylesheet"
    styleLink.href = "https://fonts.googleapis.com/css?family=Do Hyeon"
    document.head.appendChild(styleLink)

    const semanticstyleLink = document.createElement("link")
    semanticstyleLink.rel = "stylesheet"
    semanticstyleLink.href = "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css"
    document.head.appendChild(semanticstyleLink)

  }

  componentDidMount(){
     const routing = (
      <Router>
          <div>
              <Route exact path="/" component={ Login } />
              <Route path="/:id" component={(props) => <DashBoard {...props} changeuserName={(stateobj) =>{ this.setState({ ...stateobj }) }} /> } />
          </div>
      </Router>
      )

      ReactDOM.render(routing, document.getElementById('main_container'))
  }

  render(){

  return (
      <div className="App">
        <div className="title_container">
            <Title />
        </div>

        <div id="main_container" ></div>

      </div>
    )
  }
}

export default App;
