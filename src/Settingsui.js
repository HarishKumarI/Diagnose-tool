import React from 'react'
import { Icon, Dropdown, Button } from 'semantic-ui-react'
import $ from 'jquery'

export default class settings extends React.Component{
    constructor(props){
        super(props)
        this.state = this.props.uisettings

        this.addListitem = this.addListitem.bind(this)
        this.resetOptions = this.resetOptions.bind(this)
        this.saveSettings = this.saveSettings.bind(this)
    }
    
    addListitem(event,data){
        const { name, value} = data
        let temp_state = this.state
        temp_state.list[name].push(value)
        this.setState({...temp_state} )
    }

    
    resetOptions(event,data){
        const {name, value } = data
        let temp_state = this.state
        temp_state.fields[name] = value
        console.log(name,value,temp_state.fields.hide)

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
        $.post('/api/saveSettings',JSON.stringify(this.state),response =>{
            console.log(response)
            $('#savebtn').css('visibility', 'hidden')
        })
    }

    render(){
    document.title = 'Settings | CogniQA'

    let fieldOptions = []
    Object.keys(this.state.fields).forEach((column,index) => {
        if ( column !== 'default' ) 
            this.state.fields[column].forEach(( value, index1 ) => {
                fieldOptions.push({
                    key: fieldOptions.length,
                    value: value,
                    text: value
                })
            })
    } )
    
    return (
        <div className="settingsTab"> 

            <table >
                <caption><h3> Settings </h3></caption>
                <tbody>
                    <tr> 
                        <th colSpan="1"></th>
                        <td colSpan="2" style={{ textAlign: 'right' }} >  
                            <Button id="savebtn" style={{ visibility: 'hidden'}} 
                                icon labelPosition='left'
                                onClick={this.saveSettings} >
                                <Icon name='save' /> Save
                            </Button> 
                        </td> 
                    </tr>
                    {/* <tr>
                        <th>Admin</th>
                        <td colSpan='2' style={{textAlign: 'start'}}> 
                            { Object.keys(this.state.Admin).map(( userid ) =>{
                                const { name } = this.state.Admin[userid]
                               return (
                               <Label  key={userid} style={{ width: 'max-content' }}>
                                   {name}
                                   { ( userid !== "103" ) ? <Icon name='delete' /> :null }
                               </Label> )
                            }) } 
                        </td>
                    </tr> */}
                    <tr>
                        <th>Editable Fields</th>
                        <td colSpan="2"> 
                            <Dropdown fluid 
                                name="editable"
                                id="editable"
                                search allowAdditions additionPosition={'top'}
                                multiple selection
                                onChange={(event,data) => { this.value = data.value;$('#savebtn').css('visibility', 'visible') } }
                                onAddItem={(event,data) => {  fieldOptions.push({key: fieldOptions.length,value: data.value,text: data.value}) } }
                                defaultValue={ this.state.editable }
                                options={ fieldOptions }
                            />
                        </td>
                    </tr>
                    <tr >
                        <th  colSpan="2">Text Fields</th>
                    </tr>
                    <tr>
                        <td colSpan="3" > <hr /> </td>
                    </tr>
                    {
                        Object.keys(this.state.fields).map((keyName, index)=>{
                            return <tr key={index}> 
                                <th>{ keyName }: </th>
                                <td colSpan="2">
                                    { (keyName === "default") ? 
                                         <Dropdown fluid disabled
                                         name={ keyName }
                                         id={ keyName }
                                         multiple selection
                                         value={ this.state.fields[keyName] }
                                         options={ this.state.fields[keyName].map(value=>{ return {key:value,value:value,text:value}}) }
                                     />
                                    :
                                    
                                    <Dropdown fluid 
                                        name={ keyName }
                                        id={ keyName }
                                        search allowAdditions additionPosition={'top'}
                                        multiple selection
                                        onChange={ this.resetOptions }
                                        onAddItem={ (event,data) => { fieldOptions.push({key: fieldOptions.length,value: data.value,text: data.value})  }}
                                        value={ this.state.fields[keyName] }
                                        options={ fieldOptions }
                                    /> }
                                </td>
                            </tr>
                        })
                    }
                   
                    <tr >
                        <th  colSpan="2">Dropdown Fields</th>
                    </tr>
                    <tr>
                        <td colSpan="3" > <hr /> </td>
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
                   

                </tbody>
            </table>
        
        </div>
        )
    }
}