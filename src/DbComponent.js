import React, { Fragment } from 'react'
import { Table, Dropdown,Menu,Pagination, Button,Loader, TextArea } from 'semantic-ui-react'
import $ from 'jquery'


const AdminIds = [103]

class ReviewForm extends React.Component{
    constructor(props){
        super(props)
        this.state = this.props.answerData
        
        this.updateState = this.updateState.bind(this)
        this.requestServer = this.requestServer.bind(this)
        this.getrows = this.getrows.bind(this)
    }

    updateState(event,data){
        const { name, value } = data

        this.setState({ [name]: value})
    }

    requestServer(){
        this.props.updateansData(this.state)
        $.post('/api/updateRow',JSON.stringify(this.state),(response,status) => {
            console.log(response)
        })
    }

    getrows(isAdmin){
        const rows = Object.keys(this.state).map(( field, index) =>{
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

                return (
                    <tr key={index}>    
                        <td style={{ width: '120px',wordBreak:'break-word' }}>{field.replace(/_/g,' ')}: </td>
                        <td colSpan="5">
                            { ( isAdmin || field === 'issue_type' ) ?
                                <Dropdown 
                                    // text={`${this.state[field]}`}
                                    className='icon'
                                    name={ field }  
                                    onChange={ this.updateState }
                                    options={options}
                                    defaultValue={options[selectedIndex].value}
                                />
                            :  this.state[field]  } 
                        </td>
                    </tr>
                )

               }
            else 
               if ( this.props.uiSettings.editable.includes(field) ){
                    return (
                        <tr key={index}>    
                            <td style={{ width: '120px',wordBreak:'break-word' }} > {field.replace(/_/g,' ')} : </td>
                            <td colSpan="5"> 
                            {/* { ( isAdmin ) ? */}
                                    <TextArea 
                                        name={ field }
                                        placeholder={ `Type your ${field.replace(/_/g,' ')} ...` } 
                                        value={ (this.state[field] !== null ) ? this.state[field] : `Type your ${field.replace(/_/g,' ')} ...`  }
                                        onChange={ this.updateState }
                                    />
                                {/* : this.state[field] } */}
                            </td>
                        </tr>
                    )
               }
            else 
                if( this.props.uiSettings.fields.show.includes(field) )
                return (
                    <tr key={index}>    
                        <td style={{ width: '120px',wordBreak:'break-word' }} > {field.replace(/_/g,' ')} : </td>
                        <td colSpan="5"> {this.state[field]} </td>
                    </tr>
                    )
            else
                return null
        })
    
        return rows
    }

    render(){    
    const isAdmin = ( AdminIds.includes( parseInt(this.props.user_id) ) ) ? true : false

    let otherrows = this.getrows(isAdmin)

    return (
            <Fragment>
                # {this.state.id}
                <Button content="Re-Run" primary style={{ float: 'right' }} 
                    onClick={()=>{window.open(`http://univ.cogniqa.ai/${this.props.user_id}`)
                                }}  
                    />


                <Table fluid="true" inverted>
                    <Table.Body>
                        <tr>
                            <td > User Id: </td>
                            <td > {this.state.user_id} </td>
                            <td  style={{ textAlign: 'right' }}> UserName : </td>
                            <td  style={{ textAlign: 'left' }}> { this.state.username } </td>
                            <td  style={{ textAlign: 'right' }}> Email : </td>
                            <td > { this.state.email } </td>
                        </tr>

                        { otherrows }     
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center' }} >
                                {/* { ( isAdmin ) ? */}
                                <Button content=" Update Row " primary onClick={ this.requestServer} />
                                {/* : null} */}
                            </td> 
                        </tr>                   
                    </Table.Body>
                </Table> 

            </Fragment>
        )
    }
}

function DataInsights(props){
    return(
        <div className="controls" >
            <Menu secondary stackable>
                <Menu.Item
                content={ `Accuracy ${ Math.floor( props.stateObj.relevantData.length*100/( props.stateObj.data.length ) *100)/100 }%` }
                />
                <Menu.Item
                content={ `Relevant - ${ props.stateObj.relevantData.length }` }
                style={{ backgroundColor: '#365436' }}
                />
                <Menu.Item
                content={ `Not Relevant - ${ props.stateObj.data.length - props.stateObj.relevantData.length }`}
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

    constructor(props){
        super(props)

        this.state = {
            data: {},
            activeIndex: undefined,
            relevant: undefined,
            relevantData: [],
            maxrows: 20,
            startIndex: 0,
            activePage: 1,
            loading: false
        }

        this.getrows = this.getrows.bind(this)
        this.updateQue_obj = this.updateQue_obj.bind(this)
        this.handlepagination = this.handlepagination.bind(this)
    }

    componentDidMount(){

        this.setState({loading: true})
        $.get('/api/dbData',(response,status) =>{
        let reldata = []

        response.forEach(element => {
            if (element.relevant) {
                reldata.push(element)
            }
        });

        this.setState({
            data: response,
            relevantData: reldata,
            loading: false
        })
        })
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

    handlepagination(event) { 
            let pageno = event.target.innerText
            if( pageno === '>' ) 
                pageno = this.state.activePage + 1
            if( pageno === '<' )
                pageno = this.state.activePage - 1
            
            this.setState({ activePage: pageno}) 
        }


    getrows(rowsData){
        let rows = []

        for( let index = (this.state.activePage -1) * this.state.maxrows; 
             rows.length < this.state.maxrows && index < rowsData.length  ;
             index++ ){

            let que_object = rowsData[index]

            let bgColor = ( que_object.relevant ) ? '#365436' : ( que_object.relevant===undefined ) ? '' : '#c1383838' 

            if( this.state.relevant === undefined || que_object.relevant === this.state.relevant )
                rows.push(
                    <Fragment key={index}>
                        <Table.Row 
                            style={{ cursor: 'pointer', backgroundColor: bgColor }}                       
                            onClick={() => { ( this.state.activeIndex === index) ? this.setState({activeIndex: undefined}) : this.setState({activeIndex: index}) }} >
                                <Table.Cell width='1'> { index + 1 } </Table.Cell>
                                <Table.Cell width='6'> { que_object.question } </Table.Cell>
                                <Table.Cell width='3'> { ( que_object.relevant ) ? '' : 'Not ' } Relevant </Table.Cell>
                                <Table.Cell width='2' > { que_object.state } </Table.Cell>
                        </Table.Row>
                        
                        {
                            ( this.state.activeIndex === index ) ? 
                                <Table.Row  >
                                    <Table.Cell colSpan='4'>
                                        <ReviewForm answerData={que_object} uiSettings={ this.props.uiSettings } updateansData={this.updateQue_obj} user_id={this.props.user_id} />
                                    </Table.Cell>
                                </Table.Row>
                            : null
                        }
                    </Fragment>
                )   
        }

        return rows
    }


    render(){

        const relventtext = ( this.state.relevant ) ? 'Relevant' : ( this.state.relevant===undefined ) ? 'Show All' : 'Not Relevant' 
        let rowsData = ( this.state.relevant ) ? this.state.relevantData : ( this.state.relevant===undefined ) ? this.state.data : this.state.data 
        let rows = this.getrows(rowsData)
        
        return(
            <Fragment>
                { ( !this.state.loading ) ?
                <div>
                    <DataInsights stateObj={this.state} updatemaxRows={(latestmaxrows) => this.setState({maxrows : latestmaxrows})} />
                    
                    <div className="dataTable">
                        <Table inverted>
                            <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>#</Table.HeaderCell>
                                <Table.HeaderCell>Question</Table.HeaderCell>
                                <Table.HeaderCell>
                                    
                                    <Dropdown
                                        text={ relventtext }  
                                        icon='filter'
                                    >
                                        <Dropdown.Menu >
                                            <Dropdown.Item onClick={() => {this.setState({ relevant: true})} } text='Relevant' />
                                            <Dropdown.Item onClick={() => {this.setState({ relevant: false})} } text='Not Relevant' />
                                            <Dropdown.Item onClick={() => {this.setState({ relevant: undefined})} } text='Show All' />
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Table.HeaderCell>
                                <Table.HeaderCell width='1'> State </Table.HeaderCell>
                            </Table.Row>
                            </Table.Header>
                            
                            <Table.Body>
                                {rows}
                            </Table.Body>

                            <Table.Footer>
                            <Table.Row>
                                <Table.Cell colSpan='4'style={{ padding: 0,textAlign: 'center' }} >
                                    { ( rowsData.length > this.state.maxrows ) ?
                                        <Pagination inverted
                                            defaultActivePage={1}
                                            firstItem={null}
                                            prevItem={'<'}
                                            nextItem={'>'}
                                            lastItem={null}
                                            onPageChange={this.handlepagination}
                                            pointing
                                            secondary
                                            totalPages={ Math.ceil(rowsData.length / this.state.maxrows) }
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


export default function DbComponent(props){

    document.title = 'Dashboard | CogniQA'

    let  domainOptions = Object.keys(props.uisettings).map(domain => {
        if ( domain === 'Admin' ) return null
        return {
            key: domain+' QA Dashboard',
            value: domain+' QA Dashboard',
            text: domain+' QA Dashboard'
        }
    })
    domainOptions = domainOptions.filter(x => x !== null)

    let selecteddomain = domainOptions[0].value

    return(
    <div >            
            
            <h3 style={{ marginTop: 30+'px',color: 'white' }}>
                 {/* University QA Dashboard  */}
                 <Dropdown placeholder={ `${selecteddomain}` } 
                    options={domainOptions}
                    onChange={(event,data)=>{ selecteddomain = data.value }}
                 />
            </h3>
            <DbData uiSettings={ props.uisettings[selecteddomain.split(' QA Dashboard')[0]] } user_id={ props.user_id}/>

    </div>
    )

}