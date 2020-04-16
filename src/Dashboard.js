import React from 'react'
import $ from 'jquery'
import DbComponent from './DbComponent'

class Dashboard extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            user_id : "",
            isvalid: false,
            username: ""
        }
    }

    componentDidMount(){
        const userid = this.props.match.params.id
        this.setState({user_id:userid})
        
        $.post('/verify', JSON.stringify( {'userid': userid }),response =>{
            this.setState({ ...response})
            this.props.changeuserName( response.username )
        }).fail(()=>{
            console.log('could not reach server')
        })
    }

    render(){
        return(
            <div >
                { ( this.state.isvalid) ? 
                    <DbComponent user_id={this.state.user_id} />
                :
                <div style={{ marginTop: 20+'%', fontSize: 30+'px',color: 'white', width: 'max-content' }}>
                        { ( this.state.username !== "" ) ?
                            `Not a Registered User`
                        : 
                           `Not a Registered User for Team`
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