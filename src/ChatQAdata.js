import React,{ Fragment } from 'react'

import $ from 'jquery'

import { DataInsights } from './QADbdata'
import { Table, Dropdown,Pagination, Loader, Progress, Icon, TextArea, Button } from 'semantic-ui-react'

import * as json2md from 'json2md'
import * as showdown from 'showdown' 

import ReactJson from 'react-json-view'

var converter = new showdown.Converter({'noHeaderId':'true'})

class ReviewForm extends React.Component{
    constructor(props){
        super(props)

        this.updatefilter = this.updatefilter.bind(this)
        this.updateDevFeedback = this.updateDevFeedback.bind(this)
    }

    updatefilter(e, data){
        const { name, value } = data
        const { message, session_data } = this.props

        message.bot_developer_feedback[ name ] = value
        session_data.history[ message.bot_developer_feedback.index ].developer_feedback = message.bot_developer_feedback
        // console.log( name, value, message.bot_developer_feedback, session_data.history[ message.bot_developer_feedback.index ].developer_feedback )
    }

    updateDevFeedback(e){   
        const history = this.props.session_data.history.map( msg=>{
            try{
                delete msg.developer_feedback['index']
                delete msg['bot_developer_feedback']
                delete msg['idx']
            }
            catch(err){
                try{
                    delete msg['bot_developer_feedback']
                    delete msg['idx']
                }
                catch(err){ try{ delete msg['idx'] } catch(err){} }
            }

            return msg
        })

        // console.log( { session_id: this.props.session_data.session_id, history: history })
        $.post('/api/dev_feedback', JSON.stringify({ session_id: this.props.session_data.session_id, history }) , res => {
            console.log( res )
        })
    }

    render(){

        const { uiSettings, message } = this.props

        let changebleFields = [ <tr key="_"><td colSpan="8">#comments to bot response </td></tr> ]
            
        Object.keys( uiSettings.list ).forEach( ( field, idx) => {
            if( field === 'owner' )
                return null
            
            const rowTitle = field.replace(/_/g,' ')
            
            let selectedIndex = 0
            const options = uiSettings.list[field].map((option,index)=>{
                if ( message.bot_developer_feedback[field] === option) selectedIndex = index
                return {
                    key: option,
                    text: option,
                    value: option
                }
            })
            changebleFields.push(
                <tr key={idx}>    
                    <th style={{ width: '120px',wordBreak:'break-word',fontWeight: 'bold', textAlign: 'center' }}>{ rowTitle }: </th>
                    <td colSpan="7">
                        {/* { ( isAdmin || field === 'issue_type' ) ? */}
                            <Dropdown 
                                // text={`${this.state[field]}`}
                                className='icon'
                                name={ field }  
                                onChange={ this.updatefilter }
                                options={options}
                                defaultValue={options[selectedIndex].value}
                            />
                        {/* :  this.state[field]  }  */}
                    </td>
                </tr>
            )
        })

        uiSettings.editable.forEach( ( field, idx) => {
            const rowTitle = field.replace(/_/g,' ')

            changebleFields.push(
                <tr key={`${idx}_`}>    
                    <th style={{ width: '120px',wordBreak:'break-word',fontWeight: 'bold', textAlign: 'center' }} > { rowTitle } : </th>
                    <td colSpan="7" style={{ padding: '15px' }} > 
                    {/* { ( isAdmin ) ? */}
                            <TextArea 
                                name={ field }
                                placeholder={ `Type your ${field.replace(/_/g,' ')} ...` } 
                                defaultValue={ message.bot_developer_feedback[field] }
                                onChange={ this.updatefilter }
                            />
                        {/* : this.state[field] } */}
                    </td>
                </tr>
            )
        })

        changebleFields.push( <tr key="__"><td style={{ textAlign: 'center', border: 'none'}} colSpan="8"> <Button content=" Update Row " primary onClick={ this.updateDevFeedback } /> </td></tr> )        

        return changebleFields
    }
}


function LeadingText( message ){
    let text = ''
    if( message.response !== undefined && message.response !== null ){
        switch( message.response.payload.bot_response[0].type ){
            case 'TEXT': 
                const md = json2md( message.response.payload.bot_response[0].content )
                const div = document.createElement('div')
                div.innerHTML = converter.makeHtml( md )
                const htmlText = div.innerText.replace('\n','')
                text = htmlText.length > 100 ? htmlText.substr(0, 100)+'  ...' : htmlText 
                break
            case 'FORM':
            case 'CARD':
            case 'CAROUSEL':
                text = message.response.payload.bot_response[0].title
                break
            default: text = ''
        }
    }
    return text
}

function MesssageData( props ){
    const { data } = props
    // console.log( Object.keys( data ), Object.keys( data.response ) )
    return  <div style={{ padding: '0 30px' }}> 
                <div className="MesssageData_row">
                    <div> <b>Feedback Text:</b> </div>
                    <div style={{ padding: '5px 15px' }}> { data.feedback_text }  </div>
                </div>
                <div className="MesssageData_row">
                    <div><b>Query Inference Output:</b></div>
                    <div>
                        <ReactJson  style={{ textAlign: 'initial', backgroundColor: 'none' }} 
                            src={ data.inference_output ? data.inference_output : {} } theme="colors" displayDataTypes={false} 
                            displayObjectSize={ false } onEdit={ false } onAdd={ false }
                            onDelete={ false } collapsed={ true } sortKeys={ false } />
                    </div>
                </div>
                <div className="MesssageData_row">
                    <div><b>Query Payload:</b></div>
                    <div>
                        <ReactJson  style={{ textAlign: 'initial', backgroundColor: 'none' }} 
                            src={ data.payload ? data.payload : {} } theme="colors" displayDataTypes={false} 
                            displayObjectSize={ false } onEdit={ false } onAdd={ false }
                            onDelete={ false } collapsed={ true } sortKeys={ false } />
                    </div>
                </div>
                {  data.response !== undefined && data.response !== null ?
                    <>
                        <div className="MesssageData_row">
                            <div><b>Response Inference Output:</b></div>
                            <div>
                                <ReactJson  style={{ textAlign: 'initial', backgroundColor: 'none' }} 
                                    src={ data.response.inference_output ? data.response.inference_output : {} } theme="colors" displayDataTypes={false} 
                                    displayObjectSize={ false } onEdit={ false } onAdd={ false }
                                    onDelete={ false } collapsed={ false } sortKeys={ false } 
                                />
                            </div>
                        </div>
                        <div className="MesssageData_row">
                            <div><b>Response Payload:</b></div>
                            <div>
                                <ReactJson  style={{ textAlign: 'initial', backgroundColor: 'none' }} 
                                    src={ data.response.payload ? data.response.payload : {} } theme="colors" displayDataTypes={false} 
                                    displayObjectSize={ false } onEdit={ false } onAdd={ false }
                                    onDelete={ false } collapsed={ false } sortKeys={ false } />
                            </div>
                        </div>
                    </>
                : null }
            </div>
}


class MessagesTable extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            data: [],
            activePage: 1,
            sessions_data: undefined,
            maxrows: 20,
            state: undefined,
            relevant: null,
            issue_type: undefined,
            owner: undefined,
            uiSettings: undefined,
            user_id: undefined,
            fromdate: undefined,
            todate: undefined,
            activeMsg: undefined,
            activeReview: undefined
        }

        this.handlepagination = this.handlepagination.bind(this)
        this.updatefilter = this.updatefilter.bind(this)
    }

    componentDidMount(){
        this.setState({ ...this.props })
    }

    componentDidUpdate(){
        if( this.state.fromdate !== this.props.fromdate || this.state.todate !== this.props.todate 
            || this.state.maxrows !== this.props.maxrows || this.state.sessions_data !== this.props.sessions_data 
        ){
            this.setState({...this.props})
        }
    }

    updatefilter(event,data){
        const { name, value } = data
        this.setState({ [name]: value})
    }


    handlepagination(event) { 
        let pageno = event.target.innerText
        if( pageno === '>' ) 
            pageno = this.state.activePage + 1
        if( pageno === '<' )
            pageno = this.state.activePage - 1
        
        this.setState({ activePage: parseInt( pageno ) }) 
    }
    
    render(){
        const { uiSettings } = this.state
        let stateOptions = []
        let issuetypeOptions = []
        let ownerOptions = []

        if ( uiSettings !== undefined ){
            stateOptions = uiSettings.list.state.map((stateValue)=>
                    {return {key: stateValue,text:stateValue,value:stateValue } })
            stateOptions.push({key: 'showall',text:'showall',value: undefined })        
           
            ownerOptions = uiSettings.list.owner.map((owner)=>
                    {return {key: owner,text:owner,value:owner } })
            ownerOptions.push({key: 'showall',text:'showall',value: undefined })
        }

        let user_idOptions = []
        let count  = 1
        let rows = []
        let issuetypes = []

        this.state.data.forEach( ( message, idx) => {
                const issue_type = message.developer_feedback === undefined ? '-' : message.developer_feedback.issue_type === undefined ? '-' : message.developer_feedback.issue_type
                const dev_issue_type = message.bot_developer_feedback === undefined ? '-' : message.bot_developer_feedback.issue_type === undefined ? '-' : message.bot_developer_feedback.issue_type

                const msg_state =   message.bot_developer_feedback === undefined ? '-' : message.bot_developer_feedback.state

                if( ( this.state.relevant === null || message.feedback === this.state.relevant )
                    && ( this.state.user_id === undefined || this.state.user_id === message.user_id )
                    && ( this.state.state === undefined || msg_state === this.state.state ) 
                    && ( this.state.issue_type === undefined || this.state.issue_type === issue_type || this.state.issue_type === dev_issue_type )
                    && ( this.state.owner === undefined  )
                    && ( this.state.fromdate === undefined || this.state.todate === undefined || 
                        ( this.state.fromdate.date.toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}).substr(0,10) <= new Date( message.created_at ).toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}).substr(0,10) 
                            && this.state.todate.date.toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}).substr(0,10) >= new Date( message.created_at ).toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}).substr(0,10) )  ) 
                ) {
                    let issue_type = ''
                    try{
                        issue_type =  message.bot_developer_feedback.issue_type
                        if ( issue_type.length === 0 )
                            issue_type = '-'
                    }
                    catch(err){  }

                    if( !issuetypes.includes( issue_type ) )
                        issuetypes.push( issue_type )

                    user_idOptions.push( message.user_id )

                    const bgColor = `${ message.feedback ? '#365436' : message.feedback === null ? '' : '#c1383838' }`
                    let displaytext = message.response !== undefined && message.response !== null ? message.response.payload.bot_response.map( response => { return response.type } ) : []
                    // let displaytext = ''
                    const response_count = displaytext
                    displaytext = Array.from( new Set( displaytext ) )
                    if( displaytext.length > 4 )
                        displaytext = displaytext.splice( 0, 4).join(' , ') + ' ...'

                    displaytext = displaytext + '\n'
                    rows.push( 
                        <Fragment key={idx}>
                            <tr  style={{ cursor: 'pointer' }} >   
                                <td onClick={e => this.setState({ activeMsg: this.state.activeMsg !== idx ? idx : undefined, activeReview: undefined  }) }  
                                    style={{ backgroundColor: bgColor, textAlign: 'center' }} >
                                    { count }
                                </td>
                                <td onClick={e => this.setState({ activeMsg: this.state.activeMsg !== idx ? idx : undefined, activeReview: undefined  }) }  
                                    style={{ backgroundColor: bgColor, textAlign: 'center' }} >
                                    { message.session_id }
                                </td>
                                <td onClick={e => this.setState({ activeMsg: this.state.activeMsg !== idx ? idx : undefined, activeReview: undefined  }) }  
                                    style={{ backgroundColor: bgColor, textAlign: 'center' }} >
                                    { message.user_id }
                                </td>
                                <td onClick={e => this.setState({ activeMsg: this.state.activeMsg !== idx ? idx : undefined, activeReview: undefined  }) }  
                                    style={{ backgroundColor: bgColor, textAlign: 'center' }} >
                                    { 
                                        message.feedback ? 
                                            <span role="img" aria-label="positive feedback" >&#128077;</span> 
                                        :  message.feedback === null ? '' : <span role="img" aria-label="negative feedback" >&#128078;</span> 
                                    }
                                </td>
                                <td onClick={e => this.setState({ activeMsg: this.state.activeMsg !== idx ? idx : undefined, activeReview: undefined  }) }  
                                    style={{ backgroundColor: bgColor, width: 'max-content' }}
                                    >
                                    <div style={{ whiteSpace: 'pre-wrap', display: 'flex', width: '100%',  justifyContent: 'space-between' }}> 
                                        <div>
                                            <div style={{ fontWeight: 'bolder' }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: message.message }} />
                                            { displaytext }
                                            <span >{ LeadingText( message )}</span>
                                        </div>
                                        <div title="No of Responses" 
                                            style={{ border: '1px solid #4a4747', height: 'fit-content', width: 'fit-content', padding: '5px 8px', borderRadius: '3px', backgroundColor: '#484848' }}>
                                            { response_count.length }
                                        </div>
                                    </div>
                                </td>
                                <td onClick={e => this.setState({ activeReview: this.state.activeReview !== idx ? idx : undefined, activeMsg: undefined  }) } 
                                    style={{ backgroundColor: bgColor, textAlign: 'center' }} title="click to edit"
                                > 
                                    { message.bot_developer_feedback ? message.bot_developer_feedback.state : '-' }
                                </td>
                                <td onClick={e => this.setState({ activeReview: this.state.activeReview !== idx ? idx : undefined, activeMsg: undefined  }) } 
                                    style={{ backgroundColor: bgColor, textAlign: 'center' }} title="click to edit"
                                > 
                                    { message.bot_developer_feedback ? message.bot_developer_feedback.issue_type : '-' }
                                </td>
                                <td style={{ backgroundColor: bgColor, textAlign: 'center' }} > - </td>
                                <td style={{ backgroundColor: bgColor, textAlign: 'center', width: '180px' }}>{ (new Date(message.created_at) ).toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}) }</td>
                                <td style={{ backgroundColor: bgColor, textAlign: 'center' }}>
                                    <Icon name="external alternate" link={true} title="Open in Debug Interface" style={{ color: 'white' }} size="large"
                                        onClick={e  => window.open( `${uiSettings.rerunlink}${ message.session_id }` ) } 
                                    />
                                </td>
                            </tr>
                            {
                                this.state.activeMsg === idx ?
                                    <tr key={idx+'_'}>
                                        <td colSpan="7"> <MesssageData data={ message } /> </td>
                                    </tr>
                                : null
                            }
                            {
                                this.state.activeReview === idx? 
                                    <ReviewForm uiSettings={ uiSettings } message={ message } session_data={ this.state.sessions_data[ message.idx ] } />
                                : null
                            }
                        </Fragment>
                    )
                    count += 1
                }
        })


        issuetypes = Array.from( new Set( issuetypes ) )
        issuetypeOptions = issuetypes.map( issue_type => { return {key: issue_type, text: issue_type,value: issue_type } } )
        // issuetypeOptions = uiSettings.list.issue_type.map((issueType)=>
        //         {return {key: issueType,text:issueType,value:issueType } })
        issuetypeOptions.push({key: 'showall',text:'showall',value: undefined })
            

        user_idOptions = Array.from( new  Set( user_idOptions ) ).map( user_id => { return {key: user_id, text: user_id,value: user_id } } )
        user_idOptions.push({key: 'showall',text:'showall',value: undefined })

        return(
            <>
                <div className="dataTable">
                    <Table inverted>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center' }}>#</th>
                                <th style={{ textAlign: 'center' }}>Session Id</th>
                                <th>
                                    <Dropdown 
                                        text={`${(this.state.user_id === undefined) ? "User Id" : this.state.user_id }`}
                                        className='icon'
                                        name="user_id" 
                                        icon="filter"
                                        onChange={ this.updatefilter }
                                        options={user_idOptions}
                                        defaultValue={'showall'}
                                    />
                                </th>
                                <th style={{ textAlign: 'center' }}>
                                    <Dropdown
                                        text={ ( this.state.relevant ) ? 'Relevant' : ( this.state.relevant===null ) ? 'Relevancy' : 'Not Relevant'  }  
                                        icon='filter' >
                                        <Dropdown.Menu >
                                            <Dropdown.Item onClick={() => {this.setState({ relevant: true})} } text='Relevant' />
                                            <Dropdown.Item onClick={() => {this.setState({ relevant: false})} } text='Not Relevant' />
                                            <Dropdown.Item selected onClick={() => {this.setState({ relevant: null})} } text='Show All' />
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </th>
                                <th style={{ width: 'max-content', textAlign: 'center' }}> 
                                    Question
                                </th>
                                <th style={{ textAlign: 'center' }}>
                                    <Dropdown 
                                        text={`${(this.state.state === undefined) ? "All States" : this.state.state }`}
                                        className='icon'
                                        name="state" 
                                        icon="filter"
                                        onChange={ this.updatefilter }
                                        options={stateOptions}
                                        defaultValue={ 'showall' }
                                    />
                                </th>
                                <th style={{ textAlign: 'center' }} >  
                                    <Dropdown 
                                        text={`${(this.state.issue_type === undefined) ? "Issue Type" : this.state.issue_type }`}
                                        className='icon'
                                        name="issue_type" 
                                        icon="filter"
                                        onChange={ this.updatefilter }
                                        options={issuetypeOptions}
                                        defaultValue={'showall'}
                                    />
                                </th>
                                <th style={{ width: 'max-content', textAlign: 'center' }}> 
                                    <Dropdown 
                                        text={`${(this.state.owner === undefined) ? "Owner" : this.state.owner }`}
                                        className='icon'
                                        name="owner" 
                                        icon="filter"
                                        onChange={ this.updatefilter }
                                        options={ownerOptions}
                                        defaultValue={'showall'}

                                    />
                                </th>
                                <th style={{ textAlign: 'center' }}>Created at</th>
                                <th style={{ textAlign: 'center' }}>Open as Chat</th>
                            </tr>
                        </thead>
                        <tbody>                               
                            { rows.slice( (this.state.activePage-1)*this.state.maxrows , (this.state.activePage-1)*this.state.maxrows + this.state.maxrows ) }
                        </tbody>
                    </Table>
                </div>

                { ( rows.length > this.state.maxrows ) ?
                    <Pagination inverted
                        defaultActivePage={1}
                        firstItem={null}
                        prevItem={'<'}
                        nextItem={'>'}
                        lastItem={null}
                        onPageChange={this.handlepagination}
                        pointing
                        secondary
                        totalPages={ Math.ceil(rows.length / this.state.maxrows) }
                    />
                : null } 
            </>
        )
    }
}

class SessionData extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            session_data: null,
            activeIndex: 0,
            relevant: null,
            relevantCount: 0,
            state: undefined,
            owner: undefined,
            issue_type: undefined,
            maxrows: 5,
            activePage: 1,
            loading: false,
            activeMsg: undefined,
            activeReview: undefined
        }

        this.handlepagination = this.handlepagination.bind(this)
        this.updatefilter = this.updatefilter.bind( this )
    }

    componentDidMount(){
        let data = this.props.data
        data.exchages = data.exchages.map( ( msg, idx ) => { return { idx, ...msg }} )
        this.setState({ session_data: data })
    }

    updatefilter(event,data){
        const { name, value } = data
        this.setState({ [name]: value})
    }

    handlepagination(event) { 
        let pageno = event.target.innerText
        if( pageno === '>' ) 
            pageno = this.state.activePage + 1
        if( pageno === '<' )
            pageno = this.state.activePage - 1
        
        this.setState({ activePage: parseInt( pageno ) }) 
    }

    render(){
        const { session_data, activeMsg, activeReview } = this.state
        const { uiSettings } = this.props


        let stateOptions = []
        let issuetypeOptions = []
        let ownerOptions = []

        if ( uiSettings !== undefined ){
            stateOptions = uiSettings.list.state.map((stateValue)=>
                    {return {key: stateValue,text:stateValue,value:stateValue } })
            stateOptions.push({key: 'showall',text:'showall',value: undefined })


            let issuetypes = []
            if( session_data !== null ){
                issuetypes = session_data.history.map( msg => {
                    let issue_type = '-'
                    
                    try{
                        issue_type =  msg.developer_feedback.issue_type
                        if ( issue_type.length === 0 )
                            issue_type = '-'
                    }
                    catch(err){  }

                    return issue_type
                })
            }

            issuetypes = Array.from( new Set( issuetypes ) )

            issuetypeOptions = issuetypes.map( issue_type => { return {key: issue_type, text: issue_type,value: issue_type } } )

            // issuetypeOptions = uiSettings.list.issue_type.map((issueType)=>
            //         {return {key: issueType,text:issueType,value:issueType } })
            issuetypeOptions.push({key: 'showall',text:'showall',value: undefined })


                
            ownerOptions = uiSettings.list.owner.map((owner)=>
                    {return {key: owner,text:owner,value:owner } })
            ownerOptions.push({key: 'showall',text:'showall',value: undefined })
        }

        let rows = []
        let count = 1
        
        console.log( session_data )

        if( session_data !== null ){
            session_data.exchages.forEach( ( message, idx) => {

                const issue_type = message.developer_feedback.issue_type.length === 0 ? '-' : message.developer_feedback.issue_type
                const dev_issue_type = message.bot_developer_feedback === undefined ? '-' : message.bot_developer_feedback.issue_type.length === 0 ? '-' : message.bot_developer_feedback.issue_type

                const msg_state =   message.bot_developer_feedback === undefined ? '-' : message.bot_developer_feedback.state

                if( ( this.state.relevant === null || message.feedback === this.state.relevant)
                    && ( this.state.state === undefined || msg_state === this.state.state ) 
                    && ( this.state.issue_type === undefined || this.state.issue_type === issue_type || this.state.issue_type === dev_issue_type )
                    && ( this.state.owner === undefined  )
                    && ( this.state.fromdate === undefined || this.state.todate === undefined || 
                    ( this.state.fromdate.toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}).substr(0,10) <= new Date( message.created_at ).toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}).substr(0,10) 
                        && this.state.todate.toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}).substr(0,10) >= new Date( message.created_at ).toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}).substr(0,10) )  ) 
                ) {

                    const bgColor = `${ message.feedback ? '#365436' : message.feedback === null ? '' : '#c1383838' }`
                    let displaytext = message.response !== undefined && message.response !== null ? message.response.payload.bot_response.map( response => { return response.type } ) : []
                    // let displaytext = ''
                    const response_count = displaytext
                    displaytext = Array.from( new Set( displaytext ) )
                    if( displaytext.length > 4 )
                        displaytext = displaytext.splice( 0, 4).join(' , ') + ' ...'

                    displaytext = displaytext + '\n'
                    rows.push( 
                        <Fragment key={idx}>
                            <tr  style={{ cursor: 'pointer' }} > 
                                <td onClick={e => this.setState({ activeMsg: this.state.activeMsg !== idx ? idx : undefined, activeReview: undefined }) }  
                                    style={{ backgroundColor: bgColor, textAlign: 'center' }} >
                                    { count }
                                </td>
                                {/* <td style={{ backgroundColor: bgColor, textAlign: 'center', maxWidth: '100px !important' }} >{ message.sender }</td> */}
                                <td onClick={e => this.setState({ activeMsg: this.state.activeMsg !== idx ? idx : undefined, activeReview: undefined }) } 
                                    style={{ backgroundColor: bgColor, textAlign: 'center' }} >
                                    { 
                                        message.feedback ? 
                                            <span role="img" aria-label="positive feedback" >&#128077;</span> 
                                        : message.feedback === null ? '' : <span role="img" aria-label="negative feedback" >&#128078;</span> 
                                    }
                                </td>
                                <td onClick={e => this.setState({ activeMsg: this.state.activeMsg !== idx ? idx : undefined, activeReview: undefined }) } 
                                    style={{ backgroundColor: bgColor, width: 'max-content' }}>
                                    <div style={{ whiteSpace: 'pre-wrap', display: 'flex', width: '100%',  justifyContent: 'space-between' }}> 
                                        <div>
                                            <div style={{ fontWeight: 'bolder' }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: message.message }} />
                                            { displaytext }
                                            <span >{ LeadingText( message )}</span>
                                        </div>
                                        <div title="No of Responses" 
                                            style={{ border: '1px solid #4a4747', height: 'fit-content', width: 'fit-content', padding: '5px 8px', borderRadius: '3px', backgroundColor: '#484848' }}>
                                            { response_count.length }
                                        </div>
                                    </div>
                                </td>
                                <td onClick={e => this.setState({ activeReview: this.state.activeReview !== idx ? idx : undefined, activeMsg: undefined  })} 
                                    style={{ backgroundColor: bgColor, textAlign: 'center' }} title="click to edit" > 
                                    { message.bot_developer_feedback === undefined ? '-' : message.bot_developer_feedback.state.length === 0 ? '-' : message.bot_developer_feedback.state }
                                </td>
                                <td onClick={e => this.setState({ activeReview: this.state.activeReview !== idx ? idx : undefined, activeMsg: undefined  })} 
                                    style={{ backgroundColor: bgColor, textAlign: 'center', whiteSpace: 'break-spaces' }} title="click to edit"> 
                                    {   
                                        // issue_type 
                                        // +'\n'+
                                        dev_issue_type 
                                    }
                                </td>
                                <td onClick={e => this.setState({ activeReview: this.state.activeReview !== idx ? idx : undefined, activeMsg: undefined  })} 
                                    style={{ backgroundColor: bgColor, textAlign: 'center' }}> 
                                    -  
                                </td>
                            </tr>
                            {
                                activeMsg === idx ?
                                    <tr key={idx+'_'}>
                                        <td colSpan="7"> <MesssageData data={ message } /> </td>
                                    </tr>
                                : null
                            }
                            {
                                activeReview === idx? 
                                    <ReviewForm uiSettings={ uiSettings } message={ message } session_data={ session_data } />
                                : null
                            }
                        </Fragment>
                    )
                    count += 1
                }
            })
        }

        const relCount = session_data === null ? 0 :  session_data.exchages.filter( x => x.feedback === true || x.feedback === null ).length

        return( 
            
            session_data !== null ?
                <div style={{ padding: '8px', margin: '15px 0 25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div> #{ session_data.id } </div>
                        <div > 
                            <a href={ `${uiSettings.rerunlink}${ session_data.session_id }` } 
                                className="anchor_btn" target="_blank" rel="noopener noreferrer" > Open as Chat </a>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex' }}>
                        <div> <b>Session Id:</b> { session_data.session_id } </div> <span style={{ margin: '0 5px' }}></span>
                        <div> <b>User ID:</b> { session_data.user_id} </div>
                    </div>
                    <DataInsights 
                        style={{ width: '100%' }}
                        maxrows={ this.state.maxrows }
                        relcount={ relCount  } 
                        jsondata= { session_data.exchages }
                        updatemaxRows={ latestmaxrows => this.setState({maxrows : parseInt( latestmaxrows ), activePage: 1 })} 
                    />

                    <div className="dataTable">
                        <Table inverted>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'center' }}>#</th>
                                    {/* <th style={{ textAlign: 'center',  maxWidth: '100px !important' }}>
                                        <Dropdown
                                            text={`${(this.state.sender === undefined) ? "Sender" : this.state.sender }`}  
                                            icon='filter' >
                                            <Dropdown.Menu >
                                                <Dropdown.Item onClick={() => {this.setState({ sender: 'USER' })} } text='USER' />
                                                <Dropdown.Item onClick={() => {this.setState({ sender: 'BOT' })} } text='BOT' />
                                                <Dropdown.Item selected onClick={() => {this.setState({ sender: undefined})} } text='Show All' />
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </th> */}
                                    <th style={{ textAlign: 'center' }}>
                                        <Dropdown
                                            text={ ( this.state.relevant ) ? 'Relevant' : ( this.state.relevant===null ) ? 'Relevancy' : 'Not Relevant'  }  
                                            icon='filter' >
                                            <Dropdown.Menu >
                                                <Dropdown.Item onClick={() => {this.setState({ relevant: true})} } text='Relevant' />
                                                <Dropdown.Item onClick={() => {this.setState({ relevant: false})} } text='Not Relevant' />
                                                <Dropdown.Item selected onClick={() => {this.setState({ relevant: null})} } text='Show All' />
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </th>
                                    <th style={{ width: 'max-content', textAlign: 'center' }}> 
                                        Question
                                    </th>
                                    <th style={{ textAlign: 'center' }}>
                                        <Dropdown 
                                            text={`${(this.state.state === undefined) ? "All States" : this.state.state }`}
                                            className='icon'
                                            name="state" 
                                            icon="filter"
                                            onChange={ this.updatefilter }
                                            options={stateOptions}
                                            defaultValue={ 'showall' }
                                        />
                                    </th>
                                    <th style={{ textAlign: 'center' }} >  
                                        <Dropdown 
                                            text={`${(this.state.issue_type === undefined) ? "Issue Type" : this.state.issue_type }`}
                                            className='icon'
                                            name="issue_type" 
                                            icon="filter"
                                            onChange={ this.updatefilter }
                                            options={issuetypeOptions}
                                            defaultValue={'showall'}
                                        />
                                    </th>
                                    <th style={{ width: 'max-content', textAlign: 'center' }}> 
                                        <Dropdown 
                                            text={`${(this.state.owner === undefined) ? "Owner" : this.state.owner }`}
                                            className='icon'
                                            name="owner" 
                                            icon="filter"
                                            onChange={ this.updatefilter }
                                            options={ownerOptions}
                                            defaultValue={'showall'}

                                        />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>                               
                                { rows.slice( (this.state.activePage-1)*this.state.maxrows , (this.state.activePage-1)*this.state.maxrows + this.state.maxrows ) }
                            </tbody>
                        </Table>
                    </div>

                    { ( rows.length > this.state.maxrows ) ?
                        <Pagination inverted
                            defaultActivePage={1}
                            firstItem={null}
                            prevItem={'<'}
                            nextItem={'>'}
                            lastItem={null}
                            onPageChange={this.handlepagination}
                            pointing
                            secondary
                            totalPages={ Math.ceil(rows.length / this.state.maxrows) }
                        />
                    : null } 
                </div>
            :  null 
        )
    }
}


class ChatDbdata extends React.Component{
    constructor(props){
        super(props)

        this.state={
            sessions_data: [],
            activeIndex: undefined,
            relevant: undefined,
            relevantCount: 0,
            user_id: undefined,
            maxrows: 20,
            startIndex: 0,
            activePage: 1,
            loading: false,
            progress: undefined,
            fromdate: this.getDate(  ),
            todate: this.getDate(  ),
            selectedQuestions : {},
            uisettings: {},
            mode: 'mode1'
        }

        this.requestServer = this.requestServer.bind(this)
        this.handlepagination = this.handlepagination.bind(this)
        this.updatefilter = this.updatefilter.bind(this)
    }

    getDate( date ){
        var d = ''
        if ( date !== null && date !== undefined )
            d = new Date( date )
        else 
            d = new Date( )

        return  { 
                    string: `${ d.getFullYear() }-${ d.getMonth() < 10 ? '0'+String( d.getMonth() ) : d.getMonth() + 1  }-${d.getDate() < 10 ? '0'+String( d.getDate() ) : d.getDate() }`,
                    date: d 
                }
    }

    componentDidMount(){
        this.requestServer()
    }

    requestServer(){
        this.setState({ loading: true,uisettings : this.props.uiSettings })
        $.post('/api/chatDbData', {}, res =>{
            // console.log( JSON.parse( res.data[0] ).created_at )
            let sessionsList = []

            res.data.forEach( ( session, idx) => { 
                sessionsList.push({ id: idx, ...JSON.parse(session) })
            })

            let newList = sessionsList

            newList.forEach( ( session, idx) => {
                // if( idx > 0) return null

                session.exchages = []
                if( session.history !== null ){
                    session.history.forEach( ( msg, i) =>{
                        if( msg.sender === 'USER' ){
                            msg.response = null
                            msg.feedback = null
                            msg.feedback_text = null
                            msg.developer_feedback = msg.developer_feedback === undefined ? { issue_type: '', notes:'', state:'' } : msg.developer_feedback
                            msg.developer_feedback.index = i
                            session.exchages.push(msg)
                        }
                        else{
                            session.exchages[ session.exchages.length -1 ].feedback = msg.feedback
                            session.exchages[ session.exchages.length -1 ].feedback_text = msg.feedback_text
                            session.exchages[ session.exchages.length -1 ].response = msg
                            session.exchages[ session.exchages.length -1 ].bot_developer_feedback = msg.developer_feedback === undefined ? { issue_type: '', notes:'', state:'' } : msg.developer_feedback
                            session.exchages[ session.exchages.length -1 ].bot_developer_feedback.index = i
                        }
                    })
                }
            })

            // console.log( newList )
            // sessionsList.sort((a, b) => ( new Date( a.created_at ) < new Date( b.created_at ) ) ? 1 : -1  ) 
            newList.sort((a, b) => ( new Date( a.created_at ) < new Date( b.created_at ) ) ? 1 : -1  ) 

            this.setState({ sessions_data: newList , loading: false })
        })
    }

    getMessagesData( sessionsList ){
        let newList = []
        sessionsList.forEach( ( session, idx) => {
            session.exchages.forEach( msg=>{
                newList.push({ 
                    session_id: session.session_id,
                    created_at: session.created_at,
                    user_id: session.user_id,
                    ...msg,
                    idx: idx
                })
            })
        })

        return newList
    }


    updatefilter(event,data){
        const { name, value } = data
        this.setState({ [name]: value, activeIndex: undefined})
    }


    handlepagination(event) { 
        let pageno = event.target.innerText
        if( pageno === '>' ) 
            pageno = this.state.activePage + 1
        if( pageno === '<' )
            pageno = this.state.activePage - 1

        this.setState({ activePage: parseInt(pageno) }) 
    }

    render(){
        // const relventtext = ( this.state.relevant ) ? 'Relevant' : ( this.state.relevant===undefined ) ? 'Relevancy' : 'Not Relevant' 
        // console.log( this.state.sessions_data.slice( 0, 20) )
        let relevantCount = 0
        let msg_list = []
        let user_idOptions = []

        let rows = []
        let count = 1
        
        if( this.state.session_data !== null ){
            this.state.sessions_data.forEach( ( session, idx ) => {
                
                if(  (this.state.user_id === undefined || session.user_id === this.state.user_id ) 
                    && ( this.state.fromdate === undefined || this.state.todate === undefined || 
                        ( this.state.fromdate.date.toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}).substr(0,10) <= new Date( session.created_at ).toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}).substr(0,10) 
                            && this.state.todate.date.toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}).substr(0,10) >= new Date( session.created_at ).toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}).substr(0,10) )  ) 
                ){
                    user_idOptions.push( session.user_id )

                    if( session.sender !== 'USER' ){
                        relevantCount = relevantCount + session.exchages.filter( x =>  x.feedback  || x.feedback === null ).length
                        if( session.exchages !== null )
                            session.exchages.forEach( exchange => msg_list.push( exchange ) ) 
                    }

                    let positive_feedbacks = 0
                    let negative_feedbacks = 0
                    if( session.sender !== 'USER' ){
                        positive_feedbacks = session === null ? 0  : session.exchages !== null ? session.exchages.filter( x =>  x.feedback  ).length : 0
                        negative_feedbacks = session === null ? [] : session.exchages !== null ? session.exchages.filter( x => !x.feedback && x.feedback !== null  ).length : 0
                    }
                    rows.push( 
                        <Fragment key={idx}>
                            <tr 
                                style={{ cursor: 'pointer' }}
                                onClick={e => this.setState({ activeIndex: this.state.activeIndex !== idx ? idx : undefined })}
                            >
                                <td style={{ textAlign: 'center' }}>{ count }</td>
                                <td style={{ textAlign: 'center' }}>{ session.session_id }</td>
                                <td style={{ textAlign: 'center' }}>{ session.user_id }</td>
                                <td style={{ textAlign: 'center' }}>{ positive_feedbacks }</td>
                                <td style={{ textAlign: 'center' }}>{ negative_feedbacks }</td>
                                <td style={{ textAlign: 'center' }}>{ session.exchages !== null ? session.exchages.length : 0 }</td>
                                <td style={{ textAlign: 'center',width: '180px' }}>{ (new Date(session.created_at) ).toLocaleString('de-DE', { timeZone: 'Asia/Kolkata', hour12: true}) }</td>
                            </tr>     
                            {   
                                this.state.activeIndex === idx ?
                                    <tr>
                                        <td colSpan="7" > <SessionData data={session} uiSettings={ this.state.uisettings } /> </td>
                                    </tr>
                                :null
                            }
                        </Fragment>
                    )
                    count += 1
                }
            })
        }

        const msgList = this.state.mode === 'mode2' ? this.getMessagesData( this.state.sessions_data ) : []

        // console.log( relevantCount, msg_list.length )

        user_idOptions = Array.from( new  Set( user_idOptions ) ).map( user_id => { return {key: user_id, text: user_id,value: user_id } } )
        user_idOptions.push({key: 'showall',text:'showall',value: undefined })

        const maxDate = this.getDate(  )
        const minDate = this.getDate( new Date("2020-03-10") )
        const frommaxDate = this.getDate(  )
        let date = new Date( this.state.fromdate.date )
        const toMinDate = this.getDate( date )

        // console.log( "minDate", minDate,
        //              "frommaxDate", frommaxDate, 
        //              "toMinDate", toMinDate, 
        //              "maxDate", maxDate, 
        //              "fromdate", this.state.fromdate, 
        //              "todate", this.state.todate 
        //             )

        return <Fragment>
                { !this.state.loading  ?
                    <>

                        <div className="datepickers">
                            From :<input type="date" id="fromdate" name="fromdate" value={this.state.fromdate.string} 
                                    min={minDate.string}   max={frommaxDate.string}  
                                        onChange={ (event)=> {  this.setState({ fromdate : this.getDate( event.target.value), todate: new Date( event.target.value) > this.state.todate.date ? this.getDate( event.target.value) : this.state.todate }) } } /> 
                            To:   <input type="date" id="todate"   name="todate"   value={this.state.todate.string}   
                                    min={toMinDate.string} max={maxDate.string} 
                                        onChange={ (event)=>this.setState({ todate: this.getDate( event.target.value ) }) } />
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>  
                            <div className={ `${this.state.mode === 'mode1' ? 'switchbtn_selected' : '' } switchbtn` } title="List All Sessions" onClick={e=> this.setState({ mode: 'mode1' })}> Sessions </div>
                            <div className={ `${this.state.mode === 'mode2' ? 'switchbtn_selected' : '' } switchbtn` } title="List All Messages" onClick={e=> this.setState({ mode: 'mode2' })}> All Messages </div>
                            <DataInsights 
                                maxrows={ this.state.maxrows }
                                relcount={ relevantCount } 
                                jsondata= { msg_list }
                                updatemaxRows={(latestmaxrows) => this.setState({maxrows : parseInt(latestmaxrows), activePage: 1 })} 
                            />
                        </div>

                        <div style={{ color: 'white',width: '100%'}}>
                            <div style={{ margin: '10px 0',display: 'inline-block',width: 'inherit' }}> 
                                <div style={{ float: 'left' }}> # Latest on Top </div> 
                                {/* <div style={{ float: 'right' }}>Showing &nbsp; { `${rows.length} of ${this.state.data.length}` } </div>  */}
                            </div>
                            { ( this.state.progress > 0) ?  <Progress attached="bottom"  percent={ this.state.progress } inverted color='green'   /> : null }
                        </div>

                        { 
                            this.state.mode === 'mode2' ? 
                                <MessagesTable data={ msgList } uiSettings={ this.state.uisettings } sessions_data={ this.state.sessions_data }
                                    fromdate={ this.state.fromdate } todate={ this.state.todate } maxrows={this.state.maxrows}
                                />
                        :   <div className="dataTable">
                                <Table inverted>
                                    <thead style={{textAlign: 'center',height: '50px'}}>
                                        <tr>
                                            <th > 
                                                {   this.state.bulkrun  ? 
                                                    <div >Select All:<br/> 
                                                        <input type="checkbox" 
                                                            id="selectAll"
                                                            onChange={event => { 
                                                                let selectedList = undefined
                                                                rows.forEach((row,index) => { $(`#row_${index}`).prop('checked',false) })

                                                                if(event.target.checked){
                                                                    selectedList = {}
                                                                    rows.forEach((row,index) => {$(`#row_${index}`).prop('checked',true) })
                                                                }

                                                                this.setState({ selectedQuestions : selectedList || {} }) 
                                                            }}
                                                        /> 
                                                    </div> 
                                                : '#' } 
                                            </th>
                                            <th >Session Id</th>
                                            <th>
                                                <Dropdown 
                                                    text={`${(this.state.user_id === undefined) ? "User Id" : this.state.user_id }`}
                                                    className='icon'
                                                    name="user_id" 
                                                    icon="filter"
                                                    onChange={ this.updatefilter }
                                                    options={user_idOptions}
                                                    defaultValue={'showall'}
                                                />
                                            </th>
                                            <th>Explicit Positive Feedbacks</th>
                                            <th>Negative Feedbacks</th>
                                            <th>Total No of Exchanges</th>
                                            <th >Create at</th>
                                        </tr>
                                    </thead>
                                    
                                    <tbody>
                                        { rows.slice( (this.state.activePage-1)*this.state.maxrows , (this.state.activePage-1)*this.state.maxrows + this.state.maxrows ) }

                                        <tr>
                                            <td colSpan='7'style={{ padding: 0,textAlign: 'center' }} >
                                                {  rows.length > this.state.maxrows  ?
                                                    <Pagination inverted
                                                        defaultActivePage={ this.state.activePage }
                                                        firstItem={null}
                                                        prevItem={'<'}
                                                        nextItem={'>'}
                                                        lastItem={null}
                                                        onPageChange={this.handlepagination}
                                                        pointing
                                                        secondary
                                                        totalPages={ Math.ceil(rows.length / this.state.maxrows) }
                                                    />
                                                : null } 
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>

                            </div>
                        }
                    </>
                :   <Loader style={{ marginTop: '50px' }} active inline size="massive" inverted > Fetching Data </Loader>
                }
        </Fragment>
}
}

export default ChatDbdata