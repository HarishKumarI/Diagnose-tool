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
            <div style={{ minWidth: '500px' }}>
                { ( this.state.isvalid) ? 
                    <DbComponent user_id={this.state.user_id} />
                :
                <div style={{ margin: 20+'%', fontSize: 30+'px',color: 'white' }}>
                        Not a Registered User
                    </div>
                }
            </div>
        )
    }
}


export default Dashboard