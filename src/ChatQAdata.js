import React,{ Fragment } from 'react'

import $ from 'jquery'
// import moment from 'moment'

import { DataInsights } from './QADbdata'
import { Table, Dropdown,Pagination, Loader, Progress } from 'semantic-ui-react'

// import * as d3 from 'd3'
// import * as json2md from 'json2md'
// import * as showdown from 'showdown' 

import ReactJson from 'react-json-view'


// var converter = new showdown.Converter({'noHeaderId':'true'})

function MesssageData( props ){
    const { data } = props
    console.log( data )
    return  <div>
                <div className="MesssageData_row" style={{ display: 'flex',  }}>
                    <div> <b>Msg Id: </b> { data.msg_id } </div>  <span style={{ margin: '0 15px' }}></span>
                    <div> <b>Msg Rank: </b> { data.msg_rank } </div>           
                </div>
                <div className="MesssageData_row">
                    <div> <b>Feedback Text:</b> </div>
                    <div style={{ padding: '5px 15px' }}> { data.feedback_text }  </div>
                </div>
                <div className="MesssageData_row">
                    <div><b>Inference Output:</b></div>
                    <div>
                        <ReactJson  style={{ textAlign: 'initial', backgroundColor: 'none' }} 
                            src={ data.inference_output ? data.inference_output : {} } theme="colors" displayDataTypes={false} 
                            displayObjectSize={ false } onEdit={ false } onAdd={ false }
                            onDelete={ false } collapsed={ true } sortKeys={ false } />
                    </div>
                </div>
                <div className="MesssageData_row">
                    <div><b>Payload:</b></div>
                    <div>
                        <ReactJson  style={{ textAlign: 'initial', backgroundColor: 'none' }} 
                            src={ data.payload ? data.payload : {} } theme="colors" displayDataTypes={false} 
                            displayObjectSize={ false } onEdit={ false } onAdd={ false }
                            onDelete={ false } collapsed={ true } sortKeys={ false } />
                    </div>
                </div>
            </div>
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
            maxrows: 10,
            activePage: 1,
            loading: false,
            sender: undefined,
            activeMsg: undefined
        }

        this.handlepagination = this.handlepagination.bind(this)
        this.updatefilter = this.updatefilter.bind( this )
    }

    componentDidMount(){
        let data = this.props.data
        data.history = data.history.map( ( msg, idx ) => { return { idx, ...msg }} )
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
        
        this.setState({ activePage: pageno}) 
    }


    render(){
        const { session_data, activeMsg } = this.state
        const { uiSettings } = this.props

        let stateOptions = []
        let issuetypeOptions = []
        let ownerOptions = []

        if ( uiSettings !== undefined ){
            stateOptions = uiSettings.list.state.map((stateValue)=>
                    {return {key: stateValue,text:stateValue,value:stateValue } })
            stateOptions.push({key: 'showall',text:'showall',value: undefined })

            issuetypeOptions = uiSettings.list.issue_type.map((issueType)=>
                    {return {key: issueType,text:issueType,value:issueType } })
            issuetypeOptions.push({key: 'showall',text:'showall',value: undefined })
                
            ownerOptions = uiSettings.list.owner.map((owner)=>
                    {return {key: owner,text:owner,value:owner } })
            ownerOptions.push({key: 'showall',text:'showall',value: undefined })
        }


        let rows = []
        let count = 1
        
        if( session_data !== null ){
            session_data.history.forEach( ( message, idx) => {

                if( ( this.state.relevant === null || message.feedback === this.state.relevant || ( message.feedback === null && this.state.relevant ) )
                    && ( this.state.sender === undefined || message.sender === this.state.sender)
                    && ( this.state.state === undefined  ) 
                    && ( this.state.issue_type === undefined )
                    && ( this.state.owner === undefined  )
                ) {

                    const bgColor = message.sender === 'USER' ? '' : `${ message.feedback === null || message.feedback ? '#365436' : '#c1383838' }`

                    rows.push( 
                        <Fragment key={idx}>
                            <tr  style={{ cursor: 'pointer' }} 
                                onClick={e => this.setState({ activeMsg: this.state.activeMsg !== idx ? idx : undefined }) } 
                            > 
                                <td style={{ backgroundColor: bgColor, textAlign: 'center' }} >{ count }</td>
                                <td style={{ backgroundColor: bgColor, textAlign: 'center', maxWidth: '100px !important' }} >{ message.sender }</td>
                                <td style={{ backgroundColor: bgColor, textAlign: 'center' }} >
                                    { 
                                        message.sender === 'USER' ? '' :
                                            message.feedback || message.feedback === null ? 
                                                <span role="img" aria-label="positive feedback" >&#128077;</span> 
                                            :   <span role="img" aria-label="negative feedback" >&#128078;</span> 
                                    }
                                </td>
                                <td style={{ backgroundColor: bgColor, width: 'max-content' }}> 
                                    <div suppressContentEditableWarning
                                        dangerouslySetInnerHTML={{ __html: message.sender === 'USER' ? message.message : `<b>Reply for :</b><br/> ${message.payload.question}` }}
                                    />
                                </td>
                                <td style={{ backgroundColor: bgColor, textAlign: 'center' }}> - </td>
                                <td style={{ backgroundColor: bgColor, textAlign: 'center' }}> - </td>
                                <td style={{ backgroundColor: bgColor, textAlign: 'center' }}> - </td>
                            </tr>
                            {
                                activeMsg === idx ?
                                    <tr key={idx+'_'}>
                                        <td colSpan="7"> <MesssageData data={ message } /> </td>
                                    </tr>
                                : null
                            }
                        </Fragment>
                    )
                    count += 1
                }
            })
        }

        const relCount = session_data === null ? 0 : session_data.history.filter( x => ( x.feedback === true || x.feedback === null ) && x.sender !== 'USER' ).length
        const msg_list = session_data === null ? [] : session_data.history.filter( x => x.sender !== 'USER' )


        return( 
            
            session_data !== null ?
                <div style={{ padding: '8px', margin: '15px 0 25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div> #{ session_data.id } </div>
                        <div > 
                            <a href={ `http://49.206.16.34:7050/debug/${ session_data.session_id }` } 
                                className="anchor_btn" target="_blank" rel="noopener noreferrer" > Open as Chat </a>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex' }}>
                        <div> <b>Session Id:</b> { session_data.session_id } </div> <span style={{ margin: '0 5px' }}></span>
                        <div> <b>User ID:</b> { session_data.user_id} </div>
                    </div>

                    <DataInsights 
                        stateObj={ this.state }
                        relcount={ relCount  } 
                        jsondata= { msg_list }
                        updatemaxRows={ latestmaxrows => this.setState({maxrows : latestmaxrows})} 
                    />

                    <div className="dataTable">
                        <Table inverted>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'center' }}>#</th>
                                    <th style={{ textAlign: 'center',  maxWidth: '100px !important' }}>
                                        <Dropdown
                                            text={`${(this.state.sender === undefined) ? "All States" : this.state.sender }`}  
                                            icon='filter' >
                                            <Dropdown.Menu >
                                                <Dropdown.Item onClick={() => {this.setState({ sender: 'USER' })} } text='USER' />
                                                <Dropdown.Item onClick={() => {this.setState({ sender: 'BOT' })} } text='BOT' />
                                                <Dropdown.Item selected onClick={() => {this.setState({ sender: undefined})} } text='Show All' />
                                            </Dropdown.Menu>
                                        </Dropdown>
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
            activeIndex: 0,
            relevant: undefined,
            relevantCount: 0,
            state: undefined,
            owner: undefined,
            issue_type: undefined,
            maxrows: 20,
            startIndex: 0,
            activePage: 1,
            loading: false,
            progress: undefined,
            fromdate: new Date("2020-10-10"),
            todate: new Date(),
            selectedQuestions : {},
            uisettings: {}
        }

        this.requestServer = this.requestServer.bind(this)
        this.handlepagination = this.handlepagination.bind(this)
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

            sessionsList.sort((a, b) => ( new Date( a.created_at ) < new Date( b.created_at ) ) ? 1 : -1  ) 

            this.setState({ sessions_data: sessionsList , loading: false })
        })
    }


    handlepagination(event) { 
        let pageno = event.target.innerText
        if( pageno === '>' ) 
            pageno = this.state.activePage + 1
        if( pageno === '<' )
            pageno = this.state.activePage - 1
        
        this.setState({ activePage: pageno}) 
    }

    render(){
        // const relventtext = ( this.state.relevant ) ? 'Relevant' : ( this.state.relevant===undefined ) ? 'Relevancy' : 'Not Relevant' 
        // console.log( this.state.sessions_data.slice( 0, 20) )
        let feedbacks = []
        let relevantCount = 0
        let msg_list = []

        const rows = this.state.sessions_data.map( ( session, idx ) => {
                        // session = JSON.parse( session ) 

                        // console.log( session.feedbacks, session.history ) 

                        if( session.sender !== 'USER' ){
                            relevantCount = relevantCount + session.feedbacks.filter( x => x === true || x === null).length  
                            if( session.feedbacks !== null )    
                                session.feedbacks.forEach( feedback => { feedbacks.push( feedback ) })
                            if( session.history !== null )
                                session.history.forEach( hist => msg_list.push( hist ) ) 
                        }

                        let positive_feedbacks = 0
                        let botmsgslist = 0
                        if( session.sender !== 'USER' ){
                            positive_feedbacks = session === null ? 0  : session.history !== null ? session.history.filter( x => ( x.feedback  || x.feedback === null ) && x.sender !== 'USER' ).length : 0
                            botmsgslist        = session === null ? [] : session.history !== null ? session.history.filter( x => !x.feedback && x.feedback !== null && x.sender !== 'USER' ) : []
                        }
                        
                        return  <Fragment key={idx}>
                                    <tr 
                                        style={{ cursor: 'pointer' }}
                                        onClick={e => this.setState({ activeIndex: this.state.activeIndex !== idx ? idx : undefined })}
                                    >
                                        <td style={{ textAlign: 'center' }}>{ idx+1 }</td>
                                        <td style={{ textAlign: 'center' }}>{ session.session_id }</td>
                                        <td style={{ textAlign: 'center' }}>{ session.user_id }</td>
                                        <td style={{ textAlign: 'center' }}>{ positive_feedbacks }</td>
                                        <td style={{ textAlign: 'center' }}>{ botmsgslist.length }</td>
                                        <td style={{ textAlign: 'center' }}>{ session.history !== null ? session.history.length : 0 }</td>
                                        <td style={{ textAlign: 'center' }}>{ (new Date(session.created_at) ).toLocaleString() }</td>
                                    </tr>     
                                    {   
                                        this.state.activeIndex === idx ?
                                            <tr>
                                                <td colSpan="7" > <SessionData data={session} uiSettings={ this.state.uisettings } /> </td>
                                            </tr>
                                        :null
                                    }       
                                </Fragment>
                    })

        // console.log( relevantCount, feedbacks, msg_list )

        let date = new Date()
        date.setDate(date.getDate() )
        const maxDate = ( date ).toISOString().substr(0,10)
        const minDate = ( new Date("2020-03-10") ).toISOString().substr(0,10)
        date.setDate(date.getDate() -1)
        const frommaxDate = date.toISOString().substr(0,10)
        date = new Date(this.state.fromdate)
        date.setDate( date.getDate() +1 )  
        const toMinDate = date.toISOString().substr(0,10)


        return <Fragment>
                { ( !this.state.loading ) ?
                <div>

                    <div className="datepickers">
                        From :<input type="date" id="fromdate" name="fromdate" value={this.state.fromdate.toISOString().substr(0,10)} min={minDate} max={frommaxDate}  onChange={ (event)=> { this.setState({ fromdate : new Date( event.target.value) }) } } /> 
                        To:   <input type="date" id="todate"   name="todate"   value={this.state.todate.toISOString().substr(0,10)}   min={toMinDate} max={maxDate} onChange={ (event)=>this.setState({ todate: new Date( event.target.value ) }) } />
                    </div>
                    <div> 
                        <DataInsights 
                            stateObj={ this.state }
                            relcount={ relevantCount } 
                            jsondata= { msg_list }
                            updatemaxRows={(latestmaxrows) => this.setState({maxrows : latestmaxrows})} 
                        />

                        {/* <Menu secondary stackable className="rerunSet">
                            <Menu.Item
                                content={ ( this.state.bulkrun ) ? `Unselect` : `Bulk Re-run` }
                                style={{ borderLeft: '1px solid #00000047'}}
                                as={Button}
                                onClick={(event) => this.setState({bulkrun: !this.state.bulkrun})}
                            />
                            { ( Object.keys(this.state.selectedQuestions).length > 0 ) ?
                                    <Menu.Item
                                        content="Run"
                                        icon="play"
                                        as={Button}
                                        onClick={this.getBulkData}
                                    />  
                            : null}

                            { ( this.state.progress ) ? 
                                    <Menu.Item
                                        content={ (this.state.progress === 100) ? 'Download' :`${parseInt(this.state.progress)}%` }
                                        icon={ ( this.state.progress < 100 ) ? `spinner` : 'download' }
                                        as={Button}
                                        onClick={() => (this.state.progress === 100) ? this.downloadFile('tsv.tsv', this.TSVDataDump ) : null }
                                    />
                            : null }
                        </Menu> */}
                    </div>

                    <div style={{ color: 'white',width: '100%'}}>
                        <div style={{ margin: '10px 0',display: 'inline-block',width: 'inherit' }}> 
                            <div style={{ float: 'left' }}> # Latest on Top </div> 
                            {/* <div style={{ float: 'right' }}>Showing &nbsp; { `${rows.length} of ${this.state.data.length}` } </div>  */}
                        </div>
                        { ( this.state.progress > 0) ?  <Progress attached="bottom"  percent={ this.state.progress } inverted color='green'   /> : null }
                    </div>


                    <div className="dataTable">
                        <Table inverted>
                            <thead style={{textAlign: 'center',height: '50px'}}>
                                <tr>
                                    <th > 
                                        { ( this.state.bulkrun ) ? 
                                            <div >Select All:<br/> 
                                                <input type="checkbox" 
                                                    id="selectAll"
                                                    onChange={(event)=> { 
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
                                    <th>User Id</th>
                                    <th>Positive Feedbacks</th>
                                    <th>Negative Feedbacks</th>
                                    <th>No of Messages</th>
                                    <th >
                                        Create at
                                    </th>
                                </tr>
                            </thead>
                            
                            <tbody>
                                { rows.slice( (this.state.activePage-1)*this.state.maxrows , (this.state.activePage-1)*this.state.maxrows + this.state.maxrows ) }

                                <tr>
                                    <td colSpan='7'style={{ padding: 0,textAlign: 'center' }} >
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
                                    </td>
                                </tr>
                            </tbody>
                        </Table>

                    </div>
                    </div>
                : 
                <Loader style={{ marginTop: '50px' }} active inline size="massive" inverted > Fetching Data </Loader>
            }
        </Fragment>
    }
}

export default ChatDbdata