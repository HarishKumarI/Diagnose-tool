import React from 'react'
import { Icon, Dropdown, Button, Tab, Label, Divider } from 'semantic-ui-react'
import $ from 'jquery'


class SettingsPanel extends React.Component{
    constructor(props){
        super(props)
        this.state = this.props.settingsJSON

        this.addListitem = this.addListitem.bind(this)
        this.resetOptions = this.resetOptions.bind(this)
        this.saveSettings = this.saveSettings.bind(this)
    }

    componentDidMount(){
        this.setState({...this.props.settingsJSON})
    }

    componentDidUpdate(){
        if( this.state.domain !== this.props.domain )
            this.setState({ ...this.props.settingsJSON })
    }
    
    addListitem(event,data){
        const { name, value} = data
        let temp_state = this.state
        temp_state.list[name].push(value)
        this.setState({...temp_state} )
    }

    
    resetOptions(event,data){
        const {name, value } = data
        const newvalue = event.target.parentNode.innerText
        let temp_state = this.state
        temp_state.fields[name] = value
        
        /* for deselecting in the list and adding in other list  */ 

        if( newvalue.split('Add ').length === 1 && event.target.innerText === "" &&  event.keyCode !== 8)
            ( name === "show" ) ? temp_state.fields.hide.push(newvalue)  : temp_state.fields.show.push(newvalue)
 
        /* for selecting from dropdown */

        if( name === "show"){
            let hide_fields = temp_state.fields.hide.map((element)=>{
                if( value.includes(element) ) return null
                return element
            })
            temp_state.fields.hide = hide_fields.filter(x=> x !== null) 
        }
        else if ( name === "hide" ){
            let show_fields = temp_state.fields.show.map((element)=>{
                if( value.includes(element) ) return null
                return element
            })
            temp_state.fields.show = show_fields.filter(x=> x !== null)
        }
        $('#savebtn').css('visibility', 'visible')
        this.setState({...temp_state} ) 
    }


    saveSettings(event){
        event.preventDefault()

        /* get data from dropdown and use setState */
        let temp_state = this.state
        Object.keys(temp_state.list).forEach(listElement=>{
            let regexmatch = Array.from( $(`#${listElement}`)[0].innerHTML.matchAll(/<a [^>]*>(.*?)<i [^>]*><\/i><\/a>/g) )
            regexmatch = regexmatch.map(match=> { return match[1]} )
            temp_state.list[listElement] = regexmatch 
        })
        this.setState({...temp_state})    
        this.props.saveSettings(temp_state,this.props.domain)
    }

    render(){

        let fieldOptions = []
        const allFields = [ ]
        
        Object.keys(this.state.fields).forEach(field=> (field!=='default') ? allFields.push(...this.state.fields[field]) : null)
        this.state.editable.forEach(field=> ( !allFields.includes(field) ) ? allFields.push(field) : null )

        allFields.forEach((column,index) => {
            if ( column !== 'default' ) 
                fieldOptions.push({
                    key: index,
                    value: column,
                    text: column
                })
        } )

        // console.log(this.state)

        return(
        <table >
            <caption><h3> {this.props.domain} UI Settings </h3></caption>
                <tbody>
                    <tr> 
                        <td colSpan="2" > 
                            <span style={{ display: 'inline-block',width:'max-content',marginTop: '15px' }}> Priority of Showing in UI: &nbsp; Dropdown <Icon name="chevron right" /> Editable <Icon name="chevron right" /> Text Fields </span>
                        </td>
                        <td style={{ textAlign: 'right' }} >  
                            <Button id="savebtn" style={{ visibility: 'hidden'}} 
                                icon labelPosition='left'
                                onClick={ this.saveSettings } >
                                <Icon name='save' /> Save
                            </Button> 
                        </td> 
                    </tr>

                    <tr >
                        <th  colSpan="3"> <Divider horizontal inverted style={{ width: '100%',textAlign: 'center'}} > Dropdown Fields </Divider></th>
                    </tr>
                    {
                        Object.keys(this.state.list).map((listElement,index) =>{
                            return(
                                <tr key={index}>
                                    <th> { listElement.replace(/_/g,' ') }: </th>
                                    <td colSpan="2">
                                        <Dropdown fluid 
                                            id={ listElement }
                                            name={ listElement }
                                            onAddItem={ this.addListitem }
                                            search allowAdditions additionPosition={'top'}
                                            multiple selection
                                            onChange={() => { $('#savebtn').css('visibility', 'visible') } }
                                            defaultValue={ this.state.list[listElement] }
                                            options={ this.state.list[listElement].map(value=>{return{key: value,value: value,text: value} }) }
                                        />
                                    </td>
                                </tr>
                            )
                        })
                    }

                    <tr >
                        <th  colSpan="3"> <Divider horizontal inverted style={{ width: '100%',textAlign: 'center'}} > Editable Fields </Divider></th>
                    </tr>

                    <tr>
                        {/* <th>Editable Fields</th> */}
                        <td colSpan="3"> 
                            <Dropdown fluid 
                                name="editable"
                                id="editable"
                                search allowAdditions additionPosition={'top'}
                                multiple selection
                                onChange={(event,data) => { this.setState({editable: data.value}); $('#savebtn').css('visibility', 'visible') } }
                                // onAddItem={(event,data) => {  fieldOptions.push({key: fieldOptions.length,value: data.value,text: data.value}) } }
                                defaultValue={ this.state.editable }
                                options={ fieldOptions }
                            />
                        </td>
                    </tr>


                    <tr >
                        <th  colSpan="3"> <Divider horizontal inverted style={{ width: '100%',textAlign: 'center'}} > Text Fields </Divider></th>
                    </tr>
                    {
                        Object.keys(this.state.fields).map((keyName, index)=>{
                            return <tr key={index}> 
                                <th>{ keyName }: </th>
                                <td colSpan="2">
                                   
                                    <Dropdown fluid 
                                        disabled={ (keyName === "default") ? true: false }
                                        name={ keyName }
                                        id={ `field_${keyName}` }
                                        search allowAdditions additionPosition={'top'}
                                        multiple selection
                                        onChange={ this.resetOptions }
                                        // onAddItem={ (event,data) => { fieldOptions.push({key: fieldOptions.length,value: data.value,text: data.value})  }}
                                        value={ this.state.fields[keyName] }
                                        options={  (keyName === "default") ? this.state.fields[keyName].map(value=>{ return {key:value,value:value,text:value}}) : fieldOptions }
                                    /> 
                                </td>
                            </tr>
                        })
                    }

                    <tr>
                        <th> Rerun-Link </th>
                        <td colSpan="2"> 
                            <input type="text" 
                                style={{ color: 'white', backgroundColor: 'transparent',
                                            width: '100%',padding: '8px', borderRadius: '5px' }}
                                value={this.state.rerunlink || ''} 
                                onChange={(event)=>{ this.setState({ rerunlink: event.target.value }) }} />
                        </td>
                    </tr>
                

                </tbody>
            </table> 
        )
    }
}


export default function Settings(props){

    function saveSettings( stateobj,domain){
        let uisettingsJson = props.uisettings
        uisettingsJson[domain] = stateobj
        $.post('/api/saveSettings',JSON.stringify(uisettingsJson),response =>{
            console.log(response)
            $('#savebtn').css('visibility', 'hidden')
            $('#successlabel').css({'visibility':'visible'})
            setTimeout(()=>{ $('#successlabel').css({'visibility':'hidden'})} ,3000)
        })
    }

    document.title = 'Settings | CogniQA'

    const panes = Object.keys(props.uisettings).map((domain,index) => {
        if ( domain === 'Admin' ) return null
        return { menuItem: domain, 
                    render: () => 
                            <Tab.Pane> 
                                <SettingsPanel 
                                    domain={domain} 
                                    settingsJSON={props.uisettings[domain]} 
                                    saveSettings={( stateobj,domain ) => saveSettings( stateobj,domain ) }
                                /> 
                            </Tab.Pane> 
                }
    })
    
    return (
        <div className="settingsTab"> 
            <Tab 
                className="TabMenu"
                menu={{ inverted: true }}
                panes={ panes }  
                defaultActiveIndex={1}
            />
            
            <table style={{ padding: '15px' }}> 
                <tbody>
                    <tr>
                        <th>Admin</th>
                        <td colSpan='2' style={{textAlign: 'start'}}> 
                            { Object.keys(props.uisettings.Admin).map(( userid ) =>{
                                const { name } = props.uisettings.Admin[userid]
                            return (
                            <Label  key={userid} style={{ width: 'max-content' }}>
                                {name}
                                { ( userid !== "103" ) ? <Icon name='delete' /> :null }
                            </Label> )
                            }) } 
                        </td>
                    </tr> 
                </tbody>
            </table>

            <Label id="successlabel" style={{ visibility:'hidden',position: 'fixed',bottom: '20px',right: '20px',backgroundColor: '#75ea75', color:'black',padding:'15px' }}> 
                Settings Updated Successfully
            </Label>
            
        </div>
    )
}