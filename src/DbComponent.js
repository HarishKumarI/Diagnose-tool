import React, { Fragment } from 'react'
import { Table, Dropdown,Menu,Pagination, Button,Loader, TextArea, Divider, Progress } from 'semantic-ui-react'
import $ from 'jquery'
import * as d3 from 'd3'
import * as json2md from 'json2md'
import * as showdown from 'showdown' 

import ReactJson from 'react-json-view'


var converter = new showdown.Converter({'noHeaderId':'true'})


const AdminIds = [103]

class ReviewForm extends React.Component{
    constructor(props){
        super(props)
        this.state = this.props.answerData
        
        this.updatefilter = this.updatefilter.bind(this)
        this.requestServer = this.requestServer.bind(this)
        this.getrows = this.getrows.bind(this)
    }

    updatefilter(event,data){
        const { name, value } = data

        this.setState({ [name]: value})
    }

    requestServer(){
        this.props.updateansData(this.state)
        $.post('/api/updateRow',JSON.stringify({...this.state,domain: this.props.domain}),(response,status) => {
            // $('#successlabel').css({'visibility':'visible'})
            $('#root').append(`<div class="msg" > Row Updated Successfully </div>`)
            // setTimeout(()=>{ $('#successlabel').css({'visibility':'hidden'})} ,3000)
        })
        .fail((error) => {
            $('#root').append(`<div class="msg" style="background-color: rgb(221, 103, 103)"> ${error}  </div>`)
            console.error( error )
        })

    }

    strToJSON( data ){

        // console.log( data.replace(/{'/g,'{"').replace(/'}/g,'"}')
        // .replace(/: '/g,':"').replace(/':/g,'":')
        // .replace(/\['/g,'["').replace(/'\]/g,'"]')
        // .replace(/',/g,'",').replace(/, '/g,', "')
        // .replace(/None/g, null) )
        const json = ( data !== null) ?
                        JSON.parse(data.replace(/{'/g,'{"').replace(/'}/g,'"}')
                            .replace(/: '/g,':"').replace(/':/g,'":')
                            .replace(/\['/g,'["').replace(/'\]/g,'"]')
                            .replace(/',/g,'",').replace(/, '/g,', "')
                            .replace(/None/g, null) )
                        : null
        return  json
    }

    getrows(isAdmin){

        let debugData = []
        let changebleFields = [] 

        
        Object.keys(this.state).forEach(( field, index) =>{

            const rowTitle = ( field === "answer") ? "Original Answer" : field.replace(/_/g,' ')
            let answerElement = ""
            
            if ( this.props.uiSettings.fields.show.includes(field))
                try{
                answerElement =  ( field === "answer" || field === 'text' ) ? 
                        <div  style={{textAlign:"left"}} 
                            dangerouslySetInnerHTML={{ __html: converter.makeHtml( json2md( this.strToJSON( this.state[field] ) )).replace(/<a href="/g,'<a target="_blank" href="') }} /> 
                        : <ReactJson  style={{ textAlign: 'initial', backgroundColor: 'none' }} 
                                src={ this.strToJSON( this.state[field] ) } theme="colors" displayDataTypes={false} 
                                displayObjectSize={ false } onEdit={ false } onAdd={ false }
                                onDelete={ false } collapsed={ true } sortKeys={ false } />
                }
                catch(error){ 
                    // console.log( this.state[field].replace(/'/g,'"'), field )
                    answerElement = this.state[field] 
                }

            if( Object.keys(this.props.uiSettings.list).includes(field) ) {
                let selectedIndex = 0
                const options = this.props.uiSettings.list[field].map((option,index)=>{
                    if (this.state[field] === option) selectedIndex = index
                    return {
                        key: option,
                        text: option,
                        value: option
                    }
                })
                changebleFields.push(
                    <tr key={index}>    
                        <th style={{ width: '120px',wordBreak:'break-word',fontWeight: 'bold' }}>{ rowTitle }: </th>
                        <td colSpan="5">
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

               }
            else 
               if ( this.props.uiSettings.editable.includes(field) ){
                    changebleFields.push(
                        <tr key={index}>    
                            <th style={{ width: '120px',wordBreak:'break-word',fontWeight: 'bold' }} > { rowTitle } : </th>
                            <td colSpan="5"> 
                            {/* { ( isAdmin ) ? */}
                                    <TextArea 
                                        name={ field }
                                        placeholder={ `Type your ${field.replace(/_/g,' ')} ...` } 
                                        value={ (this.state[field] !== null ) ? this.state[field] : ``  }
                                        onChange={ this.updatefilter }
                                    />
                                {/* : this.state[field] } */}
                            </td>
                        </tr>
                    )
               }
            else 
                if( this.props.uiSettings.fields.show.includes(field) ){
                    debugData.push(
                        <tr key={index}>    
                            <th style={{ width: '120px',wordBreak:'break-word',fontWeight: 'bold' }} > { rowTitle } : </th>
                            <td colSpan="5"> 
                                { answerElement } 
                            </td>
                        </tr>
                        )
                }
    
        })

    
        return [debugData,changebleFields]
    }

    render(){    
    const isAdmin = ( AdminIds.includes( parseInt(this.props.user_id) ) ) ? true : false

    let [debugData,changebleFields] = this.getrows(isAdmin)

    return (
            <Fragment>
                # {this.state.id}
                <Button content="Re-Run" primary style={{ float: 'right' }} 
                    onClick={()=>{window.open(`${this.props.uiSettings.rerunlink}/${this.props.user_id}?=${this.state.question}`)
                                }}  
                    />


                <Table fluid="true" inverted>
                    <Table.Body>
                        <tr>
                            <th style={{ fontWeight: 'bold' }} > User Id: </th>
                            <td > {this.state.user_id} </td>
                            <th  style={{ textAlign: 'right',fontWeight: 'bold' }}> User Name : </th>
                            <td  style={{ textAlign: 'left' }}> { this.state.username } </td>
                            <th  style={{ textAlign: 'right',fontWeight: 'bold' }}> Email : </th>
                            <td > { this.state.email } </td>
                        </tr>

                        { debugData }

                        <tr>
                            <td colSpan="6" > <Divider horizontal inverted style={{ width: '100%',textAlign: 'center'}} > Update Review </Divider> </td>
                        </tr>
                         
                        { changebleFields }
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center' }} >
                                {/* { ( isAdmin ) ? */}
                                <Button content=" Update Row " primary onClick={ this.requestServer} />
                                {/* : null} */}
                            </td> 
                        </tr>                   
                    </Table.Body>
                </Table> 

                {/* <Label id="successlabel" style={{ visibility:'hidden',position: 'fixed',bottom: '20px',right: '20px',backgroundColor: '#75ea75', color:'black',padding:'15px' }}> 
                    Data Update Successfully 
                </Label> */}

            </Fragment>
        )
    }
}

function DataInsights(props){
    return(
        <div className="controls" >
            <Menu secondary stackable>
                <Menu.Item
                    content={ `Accuracy ${ Math.floor( props.relcount *100/( props.jsondata.length ) *100)/100 || 0 }%` }
                />
                <Menu.Item
                    content={ `Relevant - ${ props.relcount }` }
                    style={{ backgroundColor: '#365436' }}
                />
                <Menu.Item
                    content={ `Not Relevant - ${ props.jsondata.length - props.relcount }`}
                    style={{ backgroundColor: '#c1383838' }}
                />

                <Dropdown 
                    item text={`Maximum Rows ${props.stateObj.maxrows}`}
                    className='icon'
                >
                    <Dropdown.Menu  onClick={(event) => props.updatemaxRows(event.target.innerText) }>
                        <Dropdown.Item text='10' />
                        <Dropdown.Item text='20' />
                        <Dropdown.Item text='30' />
                        <Dropdown.Item text='50' />
                        <Dropdown.Item text='100' />
                    </Dropdown.Menu>
                </Dropdown>
            </Menu> 
        </div>  
    )
}

class DbData extends React.Component{
    TSVDataDump = []
    relevantCount = 0

    constructor(props){
        super(props)

        this.state = {
            domain:"",
            data: [],
            activeIndex: undefined,
            relevant: undefined,
            relevantCount: 0,
            state: undefined,
            owner: undefined,
            issue_type: undefined,
            maxrows: 20,
            startIndex: 0,
            activePage: 1,
            loading: false,
            bulkrun: false,
            progress: undefined,
            fromdate: new Date("2020-03-10"),
            todate: new Date(),
            selectedQuestions : {}
        }

        this.getrows = this.getrows.bind(this)
        this.updateQue_obj = this.updateQue_obj.bind(this)
        this.handlepagination = this.handlepagination.bind(this)
        this.getDbdata = this.getDbdata.bind(this)
        this.getBulkData = this.getBulkData.bind(this)
        this.updatefilter = this.updatefilter.bind(this)
    }

    getDbdata(){

        this.setState({loading: true})
        $.post('/api/dbData', JSON.stringify({ domain: this.props.domain}) ,(response,status) =>{
            // console.log( response )
            this.setState({
                data: response,
                loading: false,
                relevantCount: undefined,
                relevant: undefined,
                state: undefined,
                owner: undefined,
                issue_type: undefined,
                bulkrun: false,
                progress: undefined,
                fromdate: new Date("2020-03-10"),
                todate: new Date(),
                selectedQuestions : {}
            })
            this.TSVDataDump = []
        })
        .fail((error) => {
            $('#root').append(`<div class="msg" style="background-color: rgb(221, 103, 103)"> ${error}  </div>`)
            console.error( error )
        })
    }

    componentDidUpdate(){
        if ( this.state.domain !== this.props.domain ){
            this.setState({  domain: this.props.domain, activeIndex: undefined })
            this.getDbdata()
        } 
    }

    componentDidMount(){
        this.setState({ domain: this.props.domain, activeIndex: undefined })
        this.getDbdata()
    }


    updateQue_obj(obj){ 
        let temp_data = this.state.data
        
        temp_data = temp_data.map((row) => {
            if( row.id === obj.id ){
                return obj
            }
            else 
                return row
        })

        this.setState({data: temp_data})
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


    downloadFile(filename, content) {
        const element = document.createElement('a');
        const blob = new Blob([content], { type: 'application/json' });
        const fileUrl = URL.createObjectURL(blob);
        element.setAttribute('href', fileUrl);
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    async getBulkData(event){

        // console.log(Object.keys(this.state.selectedQuestions).length)

        let TSVData = []
        this.TSVDataDump = []
        this.setState({progress: 0.1,bulkrun: false})
        Object.keys(this.state.selectedQuestions).forEach((row,index) => { $(`#row_${index}`).prop('checked',false) })
        $('#selectAll').prop('checked',false)

        let questions = Object.keys(this.state.selectedQuestions)
        const controller = new AbortController();
        let continueFetch = true
        await questions.forEach( async (question,index,array)=>{
            if ( continueFetch )
            await fetch(`${this.props.uiSettings.rerunlink}/api/${this.props.user_id}`,
            {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': 'true'
                    },
                body: JSON.stringify({question:question})
            })
            .then((response)=> response.json())
            .then(response => {
                let answer_json = response[0].answer_json
                let outputjson = {feedback_id: 0,question: question,original_answer: ""}


                Object.keys(answer_json).forEach( debugKey => {
                    outputjson[debugKey] = JSON.stringify(answer_json[debugKey])
                })

                Object.keys(this.state.selectedQuestions[question]).forEach(key => {
                    outputjson[key] = JSON.stringify(this.state.selectedQuestions[question][key])
                })
                // console.log(Object.keys(outputjson))

                TSVData.push(outputjson)

                this.setState({ progress : Math.floor((index+1) * 100 /array.length) })

            },
                (error) => { 
                    this.setState({progress: undefined}) 
                    console.error( error )
                    controller.abort();
                    continueFetch = false
                    $('#root').append(`<div class="msg" style="background-color: rgb(221, 103, 103)"> ${error} </div>`)
                }
            )
            
            if ( TSVData.length === array.length ){
                // console.log( d3.tsvFormat(TSVData) )

                this.setState({ selectedQuestions: {} })
                this.TSVDataDump = d3.tsvFormat(TSVData)
                this.downloadFile('tsv.tsv', d3.tsvFormat(TSVData) )
            }
        })        
    }

    getquedict(que_data){
        return {
            feedback_id: que_data.id, 
            original_answer: que_data.answer, state: que_data.state,
            issue_type: que_data.issue_type, timestamp: que_data.timestamp,
            user_comment: que_data.comment, relevant: (que_data.relevant) ? 'YES' : 'NO'
        }
    }


    getrows(){
        // console.log(this.props.uiSettings.list.issue_type)
        let rows = []
        let dictData = []
        let count = 0
        let relcount = 0
        let feedbackData = this.state.data
        
        feedbackData.sort((a, b) => (a.timestamp < b.timestamp) ? 1 : -1)

        feedbackData.forEach((que_object,index) => {
            let openCollapse = () => {
                ( this.state.activeIndex === index  ) ? this.setState({activeIndex: undefined}) : this.setState({activeIndex: index}) 
            }
            
            let bgColor = ( que_object.relevant ) ? '#365436' : ( que_object.relevant===undefined ) ? '' : '#c1383838' 
            if( ( this.state.relevant === undefined || que_object.relevant === this.state.relevant)
                && ( this.state.state === undefined || que_object.state === this.state.state ) 
                && ( this.state.issue_type === undefined || que_object.issue_type === this.state.issue_type)
                && ( this.state.owner === undefined || que_object.owner === this.state.owner )
                && ( this.state.fromdate === undefined || this.state.todate === undefined || 
                    ( this.state.fromdate <= new Date( que_object.timestamp) && this.state.todate >= new Date( que_object.timestamp))  ) 
                ){ 

                if(que_object.relevant) relcount+=1 
                dictData.push(que_object)
                rows.push(
                    <Fragment key={index}>
                        <tr 
                            style={{ cursor: 'pointer', backgroundColor: bgColor }}                       
                            onClick={() => { if( !Object.keys(this.state.selectedQuestions).includes(que_object.question) ) openCollapse() }} >
                                <td > 
                                        { ( this.state.bulkrun ) ? 
                                        <div style={{width: 'max-content',textAlign: 'center'}} >
                                            <input type="checkbox" 
                                                value={que_object.question} 
                                                id={`row_${index}`}
                                                onChange={(event) => { 
                                                    if( !Object.keys(this.state.selectedQuestions).includes(que_object.question) ) {
                                                        let tempquestions = this.state.selectedQuestions
                                                        tempquestions[que_object.question] = this.getquedict(que_object)
                                                        this.setState({ selectedQuestions: tempquestions })
                                                    } 
                                                    else { 
                                                        let tempquestions = this.state.selectedQuestions
                                                        delete tempquestions[ que_object.question ]
                                                        this.setState({ selectedQuestions: tempquestions })
                                                    }
                                                    this.setState({activeIndex: undefined})
                                                }}
                                            /> 
                                        </div> 
                                        : count + 1 } 
                                </td>
                                <td onClick={()=> openCollapse()}> { que_object.question } </td>
                                <td style={{ textAlign: 'center' }} onClick={()=> openCollapse()}> { ( que_object.relevant ) ? '' : 'Not ' } Relevant </td>
                                <td style={{ textAlign: 'center' }} onClick={()=> openCollapse()}> { que_object.state } </td>
                                <td style={{ textAlign: 'center' }} onClick={()=> openCollapse()}> { que_object.issue_type || '-' } </td>
                                <td style={{ textAlign: 'center' }} onClick={()=> openCollapse()}> { que_object.owner || 'Komal' } </td>
                        </tr>
                        
                        {
                            ( this.state.activeIndex === index ) ? 
                                <tr  >
                                    <td colSpan='6'>
                                        <ReviewForm 
                                            answerData={que_object} 
                                            uiSettings={ this.props.uiSettings }
                                            updateansData={this.updateQue_obj} 
                                            user_id={this.props.user_id} 
                                            domain = {this.props.domain}    
                                        />

                                    </td>
                                </tr>
                            : null
                        }
                    </Fragment>
                )   
            count += 1           
            }
        })

        this.relevantCount = relcount

        return {rows,dictData }
    }


    render(){
        const relventtext = ( this.state.relevant ) ? 'Relevant' : ( this.state.relevant===undefined ) ? 'Relevancy' : 'Not Relevant' 
        let {rows, dictData} = ( this.state.data.length ) ? this.getrows() : { rows: [],dictData:[] }
        
        let stateOptions = this.props.uiSettings.list.state.map((stateValue)=>
                {return {key: stateValue,text:stateValue,value:stateValue } })
        stateOptions.push({key: 'showall',text:'showall',value: undefined })

        let issuetypeOptions = this.props.uiSettings.list.issue_type.map((issueType)=>
                {return {key: issueType,text:issueType,value:issueType } })
        issuetypeOptions.push({key: 'showall',text:'showall',value: undefined })
            
        let ownerOptions = this.props.uiSettings.list.owner.map((owner)=>
                {return {key: owner,text:owner,value:owner } })
        ownerOptions.push({key: 'showall',text:'showall',value: undefined })

        let date = new Date()
        date.setDate(date.getDate() )
        const maxDate = ( date ).toISOString().substr(0,10)
        const minDate = ( new Date("2020-03-10") ).toISOString().substr(0,10)
        date.setDate(date.getDate() -1)
        const frommaxDate = date.toISOString().substr(0,10)
        date = new Date(this.state.fromdate)
        date.setDate( date.getDate() +1 )  
        const toMinDate = date.toISOString().substr(0,10)
        
        // console.log(this.props.uiSettings)

        return(
            <Fragment>
                { ( !this.state.loading ) ?
                <div>

                    <div className="datepickers">
                        From :<input type="date" id="fromdate" name="fromdate" value={this.state.fromdate.toISOString().substr(0,10)} min={minDate} max={frommaxDate}  onChange={ (event)=> { this.setState({ fromdate : new Date( event.target.value) }) } } /> 
                        To:   <input type="date" id="todate"   name="todate"   value={this.state.todate.toISOString().substr(0,10)}   min={toMinDate} max={maxDate} onChange={ (event)=>this.setState({ todate: new Date( event.target.value ) }) } />
                    </div>
                    <div> 
                        <DataInsights 
                            stateObj={ this.state }
                            relcount={ this.relevantCount } 
                            jsondata= { dictData }
                            bulkrun = { this.state.bulkrun }
                            updatemaxRows={(latestmaxrows) => this.setState({maxrows : latestmaxrows})} 
                        />
                        <Menu secondary stackable className="rerunSet">
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
                        </Menu>
                    </div>

                    <div style={{ color: 'white',width: '100%'}}>
                        <div style={{ margin: '10px 0',display: 'inline-block',width: 'inherit' }}> 
                            <div style={{ float: 'left' }}> # Latest on Top </div> 
                            <div style={{ float: 'right' }}>Showing &nbsp; { `${rows.length} of ${this.state.data.length}` } </div> 
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
                                                            dictData.forEach((que_data) =>{  selectedList[que_data.question] = this.getquedict(que_data) })
                                                            rows.forEach((row,index) => {$(`#row_${index}`).prop('checked',true) })
                                                        }

                                                        this.setState({ selectedQuestions : selectedList || {} }) 
                                                    }}
                                                /> 
                                            </div> 
                                        : '#' } 
                                    </th>
                                    <th >Question</th>
                                    <th >
                                        <Dropdown
                                            text={ relventtext }  
                                            icon='filter' >
                                            <Dropdown.Menu >
                                                <Dropdown.Item onClick={() => {this.setState({ relevant: true})} } text='Relevant' />
                                                <Dropdown.Item onClick={() => {this.setState({ relevant: false})} } text='Not Relevant' />
                                                <Dropdown.Item selected onClick={() => {this.setState({ relevant: undefined})} } text='Show All' />
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </th>
                                    <th > 
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
                                    <th > 
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
                                    <th style={{ width: 'max-content' }}> 
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

                                <tr>
                                    <td colSpan='6'style={{ padding: 0,textAlign: 'center' }} >
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
        )
    }
}


export default class DbComponent extends React.Component{
    constructor(props){
        super(props)
        this.state = { selecteddomain : "University QA Dashboard"}
    }

    render(){
    document.title = 'Dashboard | CogniQA'

    let  domainOptions = Object.keys( this.props.uisettings).map(domain => {
        if ( domain === 'Admin' ) return null
        return {
            key: domain+' QA Dashboard',
            value: domain+' QA Dashboard',
            text: domain+' QA Dashboard'
        }
    })
    domainOptions = domainOptions.filter(x => x !== null)

    return(
    <div >            
            
            <h3 style={{ marginTop: 30+'px',color: 'white' }}>
                {/* University QA Dashboard  */}
                <Dropdown placeholder={ `${this.state.selecteddomain}` } 
                    options={domainOptions}
                    onChange={(event,data)=>{ $.ajax().abort(); this.setState({ selecteddomain : data.value}) }}
                />
            </h3>
            <DbData
             uiSettings={ this.props.uisettings[this.state.selecteddomain.split(' QA Dashboard')[0]] }
             domain={ this.state.selecteddomain.split(' QA Dashboard')[0]} 
             user_id={ this.props.user_id}
            />

    </div>
    )
    }
}