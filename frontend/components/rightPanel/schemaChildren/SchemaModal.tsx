import React, { Component, MouseEvent, ChangeEvent } from 'react';
import { Redirect, BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
const { dialog } = require('electron').remote;
const fs = require('fs');
const { ipcRenderer } = window.require('electron');
import SchemaInput from './SchemaInput';
import GenerateData from './GenerateData';

type ClickEvent = React.MouseEvent<HTMLElement>;
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

type SchemaModalProps = {
  show: boolean;
  onClose: any;
};

type state = {
  schemaName: string;
  schemaFilePath: string;
  schemaEntry: string;
  redirect: boolean;
};

class SchemaModal extends Component<SchemaModalProps, state> {
  constructor(props: SchemaModalProps) {
    super(props);
    this.handleSchemaSubmit = this.handleSchemaSubmit.bind(this);
    this.handleSchemaFilePath = this.handleSchemaFilePath.bind(this);
    this.handleSchemaEntry = this.handleSchemaEntry.bind(this);
    this.handleSchemaName = this.handleSchemaName.bind(this);

    // this.handleQueryPrevious = this.handleQueryPrevious.bind(this);
    // this.handleQuerySubmit = this.handleQuerySubmit.bind(this);
  }

  state: state = {
    schemaName: '',
    schemaFilePath: '',
    schemaEntry: '',
    redirect: false,
  };

  // Set schema name
  handleSchemaName(event: any) {
    // convert input label name to lowercase only with no spacing for db naming convention
    const schemaNameInput = event.target.value;
    let dbSafeName = schemaNameInput.toLowerCase();
    dbSafeName = dbSafeName.replace(/[^A-Z0-9]/gi, '');
    this.setState({ schemaName: dbSafeName });
  }

  // Load schema file path
  // When file path is uploaded, query entry is cleared (change to replaced by script later)
  // Add dialog box to warn user of this
  handleSchemaFilePath(event: ClickEvent) {
    event.preventDefault();
    dialog
      .showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Custom File Type', extensions: ['tar', 'sql'] }],
        message: 'Please upload .sql or .tar database file',
      })
      .then((result: object) => {
        console.log('file uploaded', result);
        const filePath = result['filePaths'];
        this.setState({ schemaFilePath: filePath });
        const schemaObj = {
          schemaName: this.state.schemaName,
          schemaFilePath: this.state.schemaFilePath,
          schemaEntry: '',
        };
        ipcRenderer.send('input-schema', schemaObj);
        console.log(`sending ${schemaObj} to main process`);
        this.onClose(event);
        // this.setState({ schemaEntry: '' });
      })
      .catch((err: object) => {
        console.log(err);
      });
  }

  // when schema script is inserted, file path is cleared
  // set dialog to warn user
  handleSchemaEntry(event: any) {
    // fs.writeFile(this.state.schemaName + '.sql', event.target.value, (err) => {
    //   if(err){
    //     console.log('error: ', err)
    //   }
    //   console.log('Successfully saved script as sql file')
    // })
    this.setState({ schemaEntry: event.target.value });
    this.setState({ schemaFilePath: '' });
    console.log('schema entry: ', this.state.schemaEntry);
    console.log('schema entry type: ', typeof this.state.schemaEntry);
  }

  handleSchemaSubmit(event: any) {
    event.preventDefault();

    const schemaObj = {
      schemaName: this.state.schemaName,
      schemaFilePath: this.state.schemaFilePath,
      schemaEntry: this.state.schemaEntry,
    };
    ipcRenderer.send('input-schema', schemaObj);
    console.log(`sending ${schemaObj} to main process`);
  }

  onClose = (event: any) => {
    this.props.onClose && this.props.onClose(event);
  };

  handleOnClick = () => {
    this.setState({redirect: true})
  }

  render() {
    if (!this.props.show) {
      return null;
    }
    // if (this.state.redirect) {
    //   return <Redirect push to="/SchemaInput"/>
    // }

    return (
      <div className="modal" id="modal">
        <Router>
          <h3>Load or input schema</h3>
          <p>Schema Name (auto-formatted): {this.state.schemaName}</p>
          <input
            className="schema-label"
            type="text"
            placeholder="Input schema label..."
            onChange={(e) => this.handleSchemaName(e)}
          />
          <button onClick={this.handleSchemaFilePath}>Load Schema</button>
          {/* <button onClick={this.handleOnClick} type="button">Input Schema</button> */}
          <Link to="/SchemaInput"><button>Input Schema</button></Link>
          {/* <button>Input Schema</button> */}
          <button className="toggle-button" onClick={this.onClose}>
            close
          </button>
          {/* <button onClick="window.location.href='/SchemaInput'">Input Schema</button> */}

          <Switch>
            <Route exact path="/SchemaInput" render={(props:any) => <SchemaInput {...props}/>}/>
            <Route exact path="/GenerateData" component={GenerateData} />
          </Switch>
        </Router>
      </div>
    );
  }
}

// SchemaModal.propTypes = {
//   onClose: PropTypes.func.isRequired,
//   show: PropTypes.bool.isRequired
// };
export default SchemaModal;

/* <div className="content">{this.props.children}</div>
          <h3>Load or input schema</h3>
          <form onSubmit={this.handleSchemaSubmit}>
            <p>First...</p>
            <input
              className="schema-label"
              type="text"
              placeholder="Input schema label..."
              onChange={(e) => this.handleSchemaName(e)}
            />
            <p>Schema label: {this.state.schemaName}</p>
            <br />
            <p>Then...</p>
            <button onClick={this.handleSchemaFilePath}>Load Schema</button>
            <p>{this.state.schemaFilePath}</p>
            <br />
            <p>Or...</p>
            <input
              className="schema-text-field"
              type="text"
              placeholder="Input Schema Here..."
              onChange={(e) => this.handleSchemaEntry(e)}
            />
            /* <input type="select" onClick={this.handleQueryPrevious}/> */
/*<div id="modal-buttons">
              <button>submit</button>
              <div className="actions">
                <button className="toggle-button" onClick={this.onClose}>
                  close
                </button>
              </div>
            </div>
          </form> */
