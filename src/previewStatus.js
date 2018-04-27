const PREVIEW_STATUS = {
  INIT: {id: 0, name: 'Initialized.'},
  VALIDATING: {id: 1, name: 'Validating on the server...'},
  RECEIVING_METADATA: {id: 2, name: 'Receiving metadata...'},
  READY: {id: 3, name: 'Ready.'},

  PROCESSING: {id: 4, name: 'Processing...'},
  POSTPROCESSING: {id: 5, name: 'Postprocessing...'},
  COMPLETED: {id: 10, name: 'Completed...'},

  FAILED_VALIDATION: {id: 20, name: 'Failed validation.'},
  FAILED_PREVIEW: {id: 21, name: 'Failed preview.'},
  FAILED_PROCESSING: {id: 22, name: 'Failed processing.'},
  FAILED_POSTPROCESSING: {id: 23, name: 'Failed postprocessing.'},

  UNKNOWN_ERROR: {id: 30, name: 'Unknown error.'},
}

module.exports = PREVIEW_STATUS
