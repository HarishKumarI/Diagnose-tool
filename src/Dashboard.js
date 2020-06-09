import React from 'react'
import $ from 'jquery'
import DbComponent from './DbComponent'
import { Dropdown } from 'semantic-ui-react'
import SettingsUi from './Settingsui'


class Dashboard extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            user_id : 0,
            isvalid: false,
            username: "",
            uicomponent: "",
            uisettings: {},
            msg: ""
        }
    }

    componentDidMount(){
        const userid = this.props.match.params.id
        this.setState({user_id:userid})

        $.get('/api/uiSettings',response => {
            this.setState({uisettings: response})
            // console.log( response)
        })
        .fail((error) => { 
            console.error( error )
        })
        
        $.post('/api/verify', JSON.stringify( {'userid': userid }),response =>{
            this.setState({ ...response})
            this.props.changeuserName( response )
        })
        .fail((error)=>{
            this.setState({ msg: error.statusText})
            $('#root').append(`<div class="msg" style="background-color: rgb(221, 103, 103)"> ${error.statusText} </div>`)
            // console.log( error )
        })
    }

    render(){
        window.onscroll = () =>{
            if ( document.documentElement.scrollTop > 10 )
                $('#userInfo').hide()
            else 
                $('#userInfo').show()
        }
        
        return(
            <div >

                { ( this.state.username !== "" && this.state.username !== undefined  ) ?
                    ( document.body.getBoundingClientRect().height <= document.body.scrollHeight  ) ?
                    <div className="userInfo" id="userInfo">
                        <Dropdown 
                            icon="user" text={`${this.state.username}`} 
                        >
                        <Dropdown.Menu id="dropdownmenu" onClick = {(event) => {
                                const selectedValue = event.target.innerText
                                if( selectedValue === 'Logout' ) window.location = '/'
                                else this.setState({ uicomponent: selectedValue}) 
                            }}  >
                            <Dropdown.Item icon="folder" text="Dashboard"/>
                            { 
                                ( Object.keys(this.state.uisettings).includes('Admin') ) ?
                                    Object.keys(this.state.uisettings.Admin).includes(  this.state.user_id ) ?
                                        <Dropdown.Item icon="settings" text="Settings"/>
                                    : null
                                : null
                            }
                            <Dropdown.Item icon="sign-out" text="Logout"/>
                        </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    :null 
                : null }

                { ( this.state.isvalid) ? 
                    (this.state.uicomponent === 'Settings') ?
                        <SettingsUi uisettings={ this.state.uisettings }  />
                    :   <DbComponent uisettings={ this.state.uisettings } user_id={this.state.user_id} />
                    
                :
                <div style={{ marginTop: 20+'%', fontSize: 30+'px',color: 'white', width: 'max-content' }}>
                        { ( this.state.username !== "" ) ?
                            `Not a Registered User`
                        : 
                            ( this.state.msg.length <= 0 ) ?`Not a Registered User for Team` : this.state.msg
                        }
                        <br/> <br />
                    <a href="/" style={{ fontSize:'18px' }}>HomePage</a>
                </div>
                }
            </div>
        )
    }
}


export default Dashboard