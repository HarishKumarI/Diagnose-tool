import React from 'react'
import { Dropdown } from 'semantic-ui-react'
import $ from 'jquery'

import { isEqual } from 'lodash'

import { DbData } from './QADbdata'
import ChatDbdata from './ChatQAdata'

export default class DbComponent extends React.Component{
    constructor(props){
        super(props)
        this.state = { selecteddomain : null, uisettings: null }
    }

    componentDidMount(){
        const domains = Object.keys( this.props.uisettings ).map( domain => { if( domain !== 'Admin') return domain; else return null } ).filter(x => x!== null)
        this.setState({ selecteddomain: domains[0], uiSettings: this.props.uiSettings })
    }

    componentDidUpdate(){
        if( !isEqual(this.state.uisettings, this.props.uisettings) ){
            const domains = Object.keys( this.props.uisettings ).map( domain => { if( domain !== 'Admin') return domain; else return null } ).filter(x => x!== null)
            this.setState({ selecteddomain: domains[0], uisettings: this.props.uisettings })
        }
    }

    
    render(){
        const { selecteddomain } = this.state
        const { uisettings } = this.props

        let domainOptions = Object.keys( this.props.uisettings ).map( domain => { 
                                if( domain === 'Admin') return null
                                
                                return {
                                            key: domain,
                                            value: domain,
                                            text: domain+' '+this.props.uisettings[domain].type+' Dashboard'
                                        }
                            })

        domainOptions = domainOptions.filter( x => x !== null)

        // console.log( this.state.selecteddomain, this.props ) 

        return(
            <div >            
                 <h3 style={{ marginTop: 30+'px',color: 'white' }}>
                    <Dropdown placeholder={ `${ selecteddomain } ${ uisettings[ selecteddomain ] !== undefined ? uisettings[selecteddomain].type : '' } Dashboard` } 
                        options={domainOptions} 
                        onChange={(event,data)=>{ $.ajax().abort(); this.setState({ selecteddomain : data.value}) }}
                    />
                </h3>
                {   
                    this.state.selecteddomain !== null && this.props.uisettings[this.state.selecteddomain ] !== undefined ?
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
        )
    }
}
