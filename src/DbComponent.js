import React, { Fragment } from 'react'
import { Table, Dropdown,Menu,Pagination, Button,Loader, TextArea, Divider, Label,Progress } from 'semantic-ui-react'
import $ from 'jquery'
import * as d3 from 'd3'


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
            $('#successlabel').css({'visibility':'visible'})
            setTimeout(()=>{ $('#successlabel').css({'visibility':'hidden'})} ,3000)
        })
    }

    getrows(isAdmin){

        let debugData = []
        let changebleFields = [] 
        
        Object.keys(this.state).forEach(( field, index) =>{

            const rowTitle = ( field === "answer") ? "Original Answer" : field.replace(/_/g,' ')

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
                        <td style={{ width: '120px',wordBreak:'break-word',fontWeight: 'bold' }}>{ rowTitle }: </td>
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
                            <td style={{ width: '120px',wordBreak:'break-word',fontWeight: 'bold' }} > { rowTitle } : </td>
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
                            <td style={{ width: '120px',wordBreak:'break-word',fontWeight: 'bold' }} > { rowTitle } : </td>
                            <td colSpan="5"> {this.state[field]} </td>
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
                            <td style={{ fontWeight: 'bold' }} > User Id: </td>
                            <td > {this.state.user_id} </td>
                            <td  style={{ textAlign: 'right',fontWeight: 'bold' }}> User Name : </td>
                            <td  style={{ textAlign: 'left' }}> { this.state.username } </td>
                            <td  style={{ textAlign: 'right',fontWeight: 'bold' }}> Email : </td>
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

                <Label id="successlabel" style={{ visibility:'hidden',position: 'fixed',bottom: '20px',right: '20px',backgroundColor: '#75ea75', color:'black',padding:'15px' }}> 
                    Data Update Successfully 
                </Label>

            </Fragment>
        )
    }
}

function DataInsights(props){
    return(
        <div className="controls" >
            <Menu secondary stackable>
                <Menu.Item
                    content={ `Accuracy ${ Math.floor( props.stateObj.relevantCount *100/( props.stateObj.data.length ) *100)/100 || 0 }%` }
                />
                <Menu.Item
                    content={ `Relevant - ${ props.stateObj.relevantCount }` }
                    style={{ backgroundColor: '#365436' }}
                />
                <Menu.Item
                    content={ `Not Relevant - ${ props.stateObj.data.length - props.stateObj.relevantCount }`}
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
            selectedQuestions : []
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
            let relcount = 0
            response.forEach(que_object => {if(que_object.relevant) relcount+=1 })
            this.setState({
                data: response,
                loading: false,
                relevantCount: relcount
            })
        }).fail(()=>{
            this.setState({loading: false})
            console.log('could not reach server or something wrong')
        })
    }

    componentDidUpdate(){
        if ( this.state.domain !== this.props.domain ){
            this.setState({  domain: this.props.domain  })
            this.getDbdata()
        } 
    }

    componentDidMount(){
        this.setState({ domain: this.props.domain })
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
        let TSVData = []
        this.TSVDataDump = []
        this.setState({progress: 0})
        this.state.selectedQuestions.forEach((row,index) => { $(`#row_${index}`).prop('checked',false) })
        $('#selectAll').prop('checked',false)

        let questions = this.state.selectedQuestions

        await questions.forEach( async (question,index,array)=>{
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
            .then((response)=> {
                let answer_json = response.json().answer_json
                delete response['answer_json']
                Object.keys(answer_json).forEach( debugKey => {
                    response[debugKey] = JSON.stringify(answer_json[debugKey])
                })

                TSVData.push(response)

                this.setState({ progress : Math.floor((index+1) * 100 /array.length) })

            },
                (error) => { 
                    this.setState({progress: undefined}) 
                    console.log('unable to connet to server')
                }
            )


            if ( TSVData.length === array.length ){
                // console.log( d3.tsvFormat(TSVData) )

                this.setState({ selectedQuestions: [] })
                this.TSVDataDump = d3.tsvFormat(TSVData)
                this.downloadFile('tsv.tsv', d3.tsvFormat(TSVData) )
            }
        })        
    }


    getrows(){
        // console.log(this.props.uiSettings.list.issue_type)
        let rows = []
        let dictData = []
        let count = 0

        this.state.data.forEach((que_object,index) => {
            let openCollapse = () => {
                ( this.state.activeIndex === index  ) ? this.setState({activeIndex: undefined}) : this.setState({activeIndex: index}) 
            }

            let bgColor = ( que_object.relevant ) ? '#365436' : ( que_object.relevant===undefined ) ? '' : '#c1383838' 
            if( ( this.state.relevant === undefined || que_object.relevant === this.state.relevant)
                && ( this.state.state === undefined || que_object.state === this.state.state ) 
                && ( this.state.issue_type === undefined || que_object.issue_type === this.state.issue_type)
                && ( this.state.owner === undefined || que_object.owner === this.state.owner)
                ){ 
                dictData.push(que_object)
                rows.push(
                    <Fragment key={index}>
                        <Table.Row 
                            style={{ cursor: 'pointer', backgroundColor: bgColor }}                       
                            onClick={() => { if( !this.state.selectedQuestions.includes(que_object.question) ) openCollapse() }} >
                                <Table.Cell width='1' > 
                                        { ( this.state.bulkrun ) ? 
                                        <div style={{width: 'max-content',textAlign: 'center'}} >
                                            <input type="checkbox" 
                                                value={que_object.question} 
                                                id={`row_${index}`}
                                                onChange={(event) => { 
                                                    if( !this.state.selectedQuestions.includes(que_object.question) ) {
                                                        let tempquestions = [...this.state.selectedQuestions]
                                                        tempquestions.push(que_object.question)
                                                        this.setState({ selectedQuestions: tempquestions })
                                                    } 
                                                    else { 
                                                        let tempquestions = [...this.state.selectedQuestions]
                                                        tempquestions.splice( this.state.selectedQuestions.indexOf( que_object.question ),1) 
                                                        this.setState({ selectedQuestions: tempquestions })
                                                    }
                                                    this.setState({activeIndex: undefined})
                                                }}
                                            /> 
                                        </div> 
                                        : count + 1 } 
                                </Table.Cell>
                                <Table.Cell width='9' onClick={()=> openCollapse()}> { que_object.question } </Table.Cell>
                                <Table.Cell width='2' onClick={()=> openCollapse()}> { ( que_object.relevant ) ? '' : 'Not ' } Relevant </Table.Cell>
                                <Table.Cell width='2' onClick={()=> openCollapse()}> { que_object.state } </Table.Cell>
                                <Table.Cell width='2' onClick={()=> openCollapse()}> { que_object.issue_type || '-' } </Table.Cell>
                                <Table.Cell width='2' onClick={()=> openCollapse()}> { que_object.owner || '' } </Table.Cell>
                        </Table.Row>
                        
                        {
                            ( this.state.activeIndex === index ) ? 
                                <Table.Row  >
                                    <Table.Cell colSpan='6'>
                                        <ReviewForm 
                                            answerData={que_object} 
                                            uiSettings={ this.props.uiSettings }
                                            updateansData={this.updateQue_obj} 
                                            user_id={this.props.user_id} 
                                            domain = {this.props.domain}    
                                        />

                                    </Table.Cell>
                                </Table.Row>
                            : null
                        }
                    </Fragment>
                )   
            count += 1           
            }
        })

        return {rows,dictData }
    }


    render(){
        const relventtext = ( this.state.relevant ) ? 'Relevant' : ( this.state.relevant===undefined ) ? 'Relevancy' : 'Not Relevant' 
        let {rows, dictData} = ( this.state.data.length ) ? this.getrows() : { rows: [],dictData:[] }
        
        let stateOptions = this.props.uiSettings.list.state.map((stateValue)=>
                {return {key: stateValue,text:stateValue,value:stateValue } })
        stateOptions.push({key: 'showall',text:'showall',value:undefined })

        let issuetypeOptions = this.props.uiSettings.list.issue_type.map((issueType)=>
                {return {key: issueType,text:issueType,value:issueType } })
        issuetypeOptions.push({key: 'showall',text:'showall',value:undefined })
            
        let ownerOptions = this.props.uiSettings.list.owner.map((owner)=>
                {return {key: owner,text:owner,value:owner } })
        ownerOptions.push({key: 'showall',text:'showall',value:undefined })
        
        return(
            <Fragment>
                { ( !this.state.loading ) ?
                <div>

                    <DataInsights 
                        stateObj={ this.state } 
                        bulkrun = { this.state.bulkrun }
                        updatemaxRows={(latestmaxrows) => this.setState({maxrows : latestmaxrows})} 
                    />
                    <Menu secondary stackable className="rerunSet">
                        <Menu.Item
                            content={ ( this.state.bulkrun ) ? `Deselect` : `Bulk Re-run` }
                            style={{ borderLeft: '1px solid #00000047'}}
                            as={Button}
                            onClick={(event) => this.setState({bulkrun: !this.state.bulkrun})}
                        />
                        { ( this.state.selectedQuestions.length > 0 || this.state.progress !== undefined ) ?
                            ( this.state.progress === undefined ) ?
                                <Menu.Item
                                    content="Run"
                                    icon="play"
                                    as={Button}
                                    onClick={this.getBulkData}
                                />  
                            : 
                                <Menu.Item
                                    content={ `${this.state.progress}%` }
                                    icon={ ( this.state.progress < 100 ) ? `spinner` : 'download' }
                                    as={Button}
                                    onClick={() => (this.state.progress === 100) ? this.downloadFile('tsv.tsv', this.TSVDataDump ) : null }
                                />
                        : null }
                    </Menu>

                    <span style={{ color: 'white', float:'left' }}>Showing &nbsp; { `${rows.length} of ${this.state.data.length}` } </span> 
                    { ( this.state.progress > 0 ) ? <Progress percent={ this.state.progress } inverted color='green'   /> : null }
                    <div className="dataTable">
                        <Table inverted>
                            <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell width="2"> 
                                    { ( this.state.bulkrun ) ? 
                                        <div style={{width: 'max-content',textAlign: 'center'}} >Select All:<br/> 
                                            <input type="checkbox" 
                                                id="selectAll"
                                                onChange={(event)=> { 
                                                    if(event.target.checked){
                                                        this.setState({selectedQuestions : dictData.map((que_data) =>{ return que_data.question }) })
                                                        rows.forEach((row,index) => {$(`#row_${index}`).prop('checked',true) })
                                                    }
                                                     else {
                                                         this.setState({ selectedQuestions : [] }) 
                                                         rows.forEach((row,index) => { $(`#row_${index}`).prop('checked',false) })
                                                    }
                                                }}
                                            /> 
                                        </div> 
                                    : '#' } 
                                </Table.HeaderCell>
                                <Table.HeaderCell >Question</Table.HeaderCell>
                                <Table.HeaderCell width="2">
                                    <Dropdown
                                        text={ relventtext }  
                                        icon='filter' >
                                        <Dropdown.Menu >
                                            <Dropdown.Item onClick={() => {this.setState({ relevant: true})} } text='Relevant' />
                                            <Dropdown.Item onClick={() => {this.setState({ relevant: false})} } text='Not Relevant' />
                                            <Dropdown.Item onClick={() => {this.setState({ relevant: undefined})} } text='Show All' />
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Table.HeaderCell>
                                <Table.HeaderCell width="2" > 
                                    <Dropdown 
                                        text={`${(this.state.state === undefined) ? "All States" : this.state.state }`}
                                        className='icon'
                                        name="state" 
                                        icon="filter"
                                        onChange={ this.updatefilter }
                                        options={stateOptions}
                                        defaultValue={stateOptions[0].value}
                                    />
                                </Table.HeaderCell>
                                <Table.HeaderCell width="2"> 
                                    <Dropdown 
                                        text={`${(this.state.issue_type === undefined) ? "Issue Type" : this.state.issue_type }`}
                                        className='icon'
                                        name="issue_type" 
                                        icon="filter"
                                        onChange={ this.updatefilter }
                                        options={issuetypeOptions}
                                        defaultValue={issuetypeOptions[0].value}
                                    />
                                </Table.HeaderCell>
                                <Table.HeaderCell width="2"> 
                                    <Dropdown 
                                        text={`${(this.state.owner === undefined) ? "Owner" : this.state.owner }`}
                                        className='icon'
                                        name="owner" 
                                        icon="filter"
                                        onChange={ this.updatefilter }
                                        options={ownerOptions}
                                        defaultValue={ownerOptions[0].value}
                                    />
                                </Table.HeaderCell>
                            </Table.Row>
                            </Table.Header>
                            
                            <Table.Body>
                                { rows.slice( (this.state.activePage-1)*this.state.maxrows , (this.state.activePage-1)*this.state.maxrows + this.state.maxrows ) }
                            </Table.Body>

                            <Table.Footer>
                            <Table.Row>
                                <Table.Cell colSpan='6'style={{ padding: 0,textAlign: 'center' }} >
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
                                </Table.Cell>
                            </Table.Row>
                            </Table.Footer>
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
                    onChange={(event,data)=>{ this.setState({ selecteddomain : data.value}) }}
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