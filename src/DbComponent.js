import React from 'react'
import { Dropdown } from 'semantic-ui-react'
import $ from 'jquery'

import { DbData } from './QADbdata'
import ChatDbdata from './ChatQAdata'

export default class DbComponent extends React.Component{
    constructor(props){
        super(props)
        this.state = { selecteddomain : null }
    }

    componentDidMount(){
        const domain = Object.keys( this.props.uisettings ).map( domain => { if( domain !== 'Admin') return domain; else return null } ).filter(x => x!== null)[0]
        this.setState({ selecteddomain: domain })
    }

    render(){
    document.title = 'Dashboard | CogniQA'

    let  domainOptions = Object.keys( this.props.uisettings).map( domain => {
        if ( domain === 'Admin' ) return null
        return {
            key:   domain ,
            value: domain ,
            text:  domain + ' '+ this.props.uisettings[domain].type + ' Dashboard'
        }
    })
    domainOptions = domainOptions.filter(x => x !== null)
    
    // console.log( this.state.selecteddomain )

    return(
    <div >            
        {/* { ( this.props.uisettings !== undefined ) ?  */}
            <div>
                <h3 style={{ marginTop: 30+'px',color: 'white' }}>
                    {/* University QA Dashboard  */}
                    <Dropdown placeholder={ `${this.state.selecteddomain}` } 
                        options={domainOptions}
                        onChange={(event,data)=>{ $.ajax().abort(); this.setState({ selecteddomain : data.value}) }}
                    />
                </h3>
                {   this.state.selecteddomain !== null ?
                        this.props.uisettings[this.state.selecteddomain ].type === 'QA' ?
                            <DbData
                                uiSettings={ this.props.uisettings[this.state.selecteddomain ] }
                                domain={ this.state.selecteddomain } 
                                user_id={ this.props.user_id}
                            />
                        :   <ChatDbdata 
                                uiSettings={ this.props.uisettings[this.state.selecteddomain ] }
                                domain={ this.state.selecteddomain } 
                                user_id={ this.props.user_id}
                            />
                    : null
                }
            </div>
        {/* : null} */}
    </div>
    )
    }
}