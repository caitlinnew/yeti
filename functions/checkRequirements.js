import { createRulesetFunction } from '@stoplight/spectral-core';

// List of attributes to be checked
// For all attributes in ATTRIBUTES_TO_CHECK, this Spectral rule will make sure:
// * if attribute is in the Spec - the attribute MUST also be in the requirements
// * if attribute is in the requirements - then it also need to be in the Spec
const ATTRIBUTES_TO_CHECK= ['type', 'maxLength', 'pattern', 'enum', 'format', 'deprecated', 'discriminator', 'exclusiveMaximum',
  'exclusiveMinimum', 'maximum', 'minimum', 'minItems', 'required', 'nullable', 'items', 'title'];

// List of Objects that must follow the CloudEvent Notification pattern
const DCSA_CLOUDEVENT_GROUP = { ShippingInstructionsNotification: {},TransportDocumentNotification: {}, BookingNotification: {}, ArrivalNoticeNotification: {} };

// Spectral will **ONLY** check the standards in this list (in the future all APIs should be covered).
const COVERED_STANDARDS = new Set([
  // Booking Beta 1 Notification
  'BKG_NTF_v2.0.0-Beta-1.yaml',
  // Booking Beta 2
  'BKG_v2.0.0-Beta-2.yaml', 'BKG_NTF_v2.0.0-Beta-2.yaml',
  // Booking Beta 3
  'BKG_v2.0.0-Beta-3.yaml', 'BKG_NTF_v2.0.0-Beta-3.yaml',
  // EBL Beta 1 Notification
  'ebl_ntf_v3.0.0-Beta-1.yaml',
  // EBL Beta 2
  'EBL_v3.0.0-Beta-2.yaml', 'EBL_NTF_v3.0.0-Beta-2.yaml', 'EBL_ISS_v3.0.0-Beta-2.yaml', 'EBL_ISS_RSP_v3.0.0-Beta-2.yaml', 'EBL_SUR_v3.0.0-Beta-2.yaml', 'EBL_SUR_RSP_v3.0.0-Beta-2.yaml',
  // EBL Beta 3
  'EBL_v3.0.0-Beta-3.yaml', 'EBL_NTF_v3.0.0-Beta-3.yaml', 'EBL_ISS_v3.0.0-Beta-3.yaml', 'EBL_ISS_RSP_v3.0.0-Beta-3.yaml', 'EBL_SUR_v3.0.0-Beta-3.yaml', 'EBL_SUR_RSP_v3.0.0-Beta-3.yaml'
]);

// Standard covering EBL Beta 2
const EBL_BETA2_GROUP = [
  'EBL_v2.0.0-Beta-2.yaml', 'EBL_ISS_v2.0.0-Beta-2.yaml', 'EBL_ISS_RSP_v2.0.0-Beta-2.yaml',
  'EBL_SUR_v2.0.0-Beta-2.yaml', 'EBL_SUR_RSP_v2.0.0-Beta-2.yaml'
];

// A list of accepted properties that have changed over time or are different for different standards
// DEFAULT covers all remaining standards
// "GROUPS" - e.g. EBL_BETA2_GROUP: this covers all standards in the EBL Beta 2 release (EBL, ISS, ISS_RSP, SUR, SUR_RSP, EBL_NFT, PINT)
// - it is possible to define more groups in which the group need to be added next to where EBL_BETA2_GROUP is used
// If 'parent' is specified - then the spec only allows the property under the list of parents
// If no 'parent' is specified - the spec applies to all locations in the document
// parents-specs overrule "globalSpec"
// Enum and required fields (fields specified as lists) MUST be defined in same order
const DCSA_PROPERTIES = {
  ActiveReeferSettings: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Active Reefer Settings', required: ['temperatureSetpoint', 'temperatureUnit']}, parents: {} },
  },
  activeReeferSettings: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Active Reefer Settings', required: ['temperatureSetpoint', 'temperatureUnit'], allOf: true}, parents: {RequestedEquipment: {} } },
  },
  additionalContainerCargoHandling: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 255}, parents: {DangerousGoods: {}}},
  },
  address: {
    'DEFAULT'               : {parents: {AddressLocation: {$ref: '#/components/schemas/Address'}, BookingAgent: {$ref: '#/components/schemas/PartyAddress'}, Shipper: {$ref: '#/components/schemas/PartyAddress'}, Consignee: {$ref: '#/components/schemas/PartyAddress'}, ServiceContractOwner: {$ref: '#/components/schemas/PartyAddress'}, CarrierBookingOffice: {$ref: '#/components/schemas/Address'}, Party: {$ref: '#/components/schemas/PartyAddress'}}},
  },
  Address: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Address'}, parents: {}},
  },
  AddressLocation: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Address Location', required: ['locationType', 'address']}, parents: {}},
  },
  advanceManifestFilings: {
    'DEFAULT':                {globalSpec: {type: 'array', items: {$ref: '#/components/schemas/AdvanceManifestFiling'}}, parents: {Booking: {} } },
  },
  AdvanceManifestFiling: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Advance Manifest Filing', required: ['manifestTypeCode', 'countryCode']}, parents: {}},
  },
  airExchangeSetpoint: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float', minimum: 0}, parents: {ActiveReeferSettings: {}} },
  },
  airExchangeUnit: {
    'DEFAULT':                {globalSpec: {type: 'string', enum: ['MQH', 'FQH']}, parents: {ActiveReeferSettings: {}} },
  },
  amendedBookingStatus: {
    'BKG_NTF_v2.0.0-Beta-2.yaml': {globalSpec: { type: 'string', maxLength: 50}, parents: {data: {}}},
    'DEFAULT'               : {globalSpec: { type: 'string', maxLength: 50}, parents: {Booking: {}, BookingRefStatus: {}, BookingRefCancelledStatus: {}}},
  },
  Booking: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Booking', required: ['bookingStatus', 'receiptTypeAtOrigin', 'deliveryTypeAtDestination', 'cargoMovementTypeAtOrigin', 'cargoMovementTypeAtDestination', 'isPartialLoadAllowed', 'isExportDeclarationRequired', 'isImportLicenseRequired', 'communicationChannelCode', 'isEquipmentSubstitutionAllowed', 'shipmentLocations', 'requestedEquipments', 'documentParties']}, parents: {}},
  },
  bookingAgent: {
    'DEFAULT'               : {globalSpec: {$ref: '#/components/schemas/BookingAgent'}, parents: {documentParties: {}}},
  },
  BookingAgent: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Booking Agent', required: ['partyName']}, parents: {} },
  },
  bookingChannelReference: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 20, pattern: '^\\S(?:.*\\S)?$'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}} },
  },
  BookingRefCancelledStatus: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Cancelled Booking Response', required: ['bookingStatus']}, parents: {}},
  },
  BookingRefStatus: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Booking Response', required: ['bookingStatus']}, parents: {}},
  },
  BookingNotification: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Booking Notification', required: ['specversion', 'id', 'source', 'type', 'time', 'datacontenttype', 'subscriptionReference', 'data']}, parents: {}},
  },
  bookingStatus: {
    'BKG_NTF_v2.0.0-Beta-2.yaml': {globalSpec: { type: 'string', maxLength: 50}, parents: {data: {}}},
    DEFAULT:                  {globalSpec: { type: 'string', maxLength: 50}, parents: {Booking: {}, BookingRefStatus: {}, BookingRefCancelledStatus: {}}},
  },
  calculationBasis: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 50, pattern: '^\\S(?:.*\\S)?$'}, parents: {Charge: {}} },
  },
  callSign: {
    'jit_v1.2.0-Beta-2.yaml' :{globalSpec: {type: 'string', maxLength: 10} }
  },
  cargoGrossVolume: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float', minimum: 0, exclusiveMinimum: true}, parents: {Commodity: {}} },
  },
  cargoGrossVolumeUnit: {
    DEFAULT:                  {globalSpec: {type: 'string', enum: ['MTQ', 'FTQ']}, parent: {Commodity: {}}}
  },
  cargoGrossWeight: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float', minimum: 0, exclusiveMinimum: true}, parents: {Commodity: {}} },
  },
  cargoGrossWeightUnit: {
    DEFAULT:                  {globalSpec: {type: 'string', enum: ['KGM', 'LBR']}, parent: {Commodity: {}}}
  },
  cargoMovementTypeAtOrigin: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 3}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}} },
  },
  cargoMovementTypeAtDestination: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 3}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}} },
  },
  carrierBookingOffice: {
    'DEFAULT'               : {globalSpec: {$ref: '#/components/schemas/CarrierBookingOffice'}, parents: {documentParties: {}}},
  },
  CarrierBookingOffice: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Carrier Booking Office', required: ['partyName', 'UNLocationCode']}, parents: {} },
  },
  carrierBookingRequestReference: {
    'BKG_NTF_v2.0.0-Beta-1.yaml': {globalSpec: {type: 'string', maxLength: 100, pattern: '^\\S+(\\s+\\S+)*$'} }, //BKG NTF 2.0.0 Beta 1
    'BKG_NTF_v2.0.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 100, pattern: '^\\S(?:.*\\S)?$'}, parents: {data: {}} },
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 100, pattern: '^\\S(?:.*\\S)?$'}, parents: {UpdateBooking: {}, Booking: {}, BookingRefStatus: {}, BookingRefCancelledStatus: {}} },
  },
  carrierBookingReference: {
    'BKG_NTF_v2.0.0-Beta-1.yaml': {globalSpec: {type: 'string', maxLength: 35, pattern: "^\\S+(\\s+\\S+)*$"} }, //BKG NTF 2.0.0 Beta 1
    'BKG_NTF_v2.0.0-Beta-2.yaml':{globalSpec: {type: 'string', maxLength: 35, pattern: '^\\S(?:.*\\S)?$'}, parents: {data: {} } },
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 35, pattern: '^\\S(?:.*\\S)?$'}, parents: {UpdateBooking: {}, Booking: {}, BookingRefStatus: {}, BookingRefCancelledStatus: {}} }, //BKG NTF 2.0.0 Beta 1
  },
  carrierClauses: {
    'DEFAULT':                {globalSpec: {type: 'array', items: {type: 'string', maxLength: 20000, pattern: '^\\S(?:.*\\S)?$'}}, parents: {Booking: {} } },
  },
  carrierExportVoyageNumber: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 50}},
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 50, pattern: '^\\S(?:.*\\S)?$'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}, Transport: {}} },
  },
  carrierImportVoyageNumber: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 50}},
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 50, pattern: '^\\S(?:.*\\S)?$'}, parents: {Transport: {}} },
  },
  carrierServiceCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 5}},
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 11, pattern: '^\\S(?:.*\\S)?$'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}, Transport: {}} },
  },
  carrierServiceName: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 50, pattern: '^\\S(?:.*\\S)?$'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}} },
  },
  carrierTransportCallReference: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 100}, parents: {timestamp: {} }},
  },
  carrierVoyageNumber: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 50, deprecated: true}},
  },
  Charge: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Charge', required: ['chargeName', 'currencyAmount', 'currencyCode', 'paymentTermCode', 'calculationBasis', 'unitPrice', 'quantity']}, parents: {}},
  },
  chargeName: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 50, pattern: '^\\S(?:.*\\S)?$'}, parents: {Charge: {}} },
  },
  charges: {
    'DEFAULT':                {globalSpec: {type: 'array', items: {$ref: '#/components/schemas/Charge'}}, parents: {Booking: {} } },
  },
  city: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 65}, parents: {address: {} } },
    'DEFAULT'               : {globalSpec: {type: 'string', maxLength: 65, pattern: '^\\S(?:.*\\S)?$'}, parents: {address: {}, Address: {}, PartyAddress: {} } },
  },
  co2Setpoint: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float', minimum: 0, maximum: 100}, parents: {ActiveReeferSettings: {}} },
  },
  CocEquipment: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Carrier owned Equipment', required: ['isShipperOwned']}, parents: {} },
  },
  codedVariantList: {
    'DEFAULT':                {globalSpec: {type: 'string', minLength: 4, maxLength: 4, pattern: '^[0-3][0-9A-Z]{3}$'}, parents: {DangerousGoods: {} } },
  },
  codeListName: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 100}, parents: {IdentifyingCode: {}, identifyingCode: {}} },
  },
  codeListProvider: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 100}, parents: {IdentifyingCode: {}} },
  },
  codeListResponsibleAgencyCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', deprecated: true, enum: ['5','6','11','20','54','182','274','296','306','399','zzz'] }, parents: {identifyingCode: {} }},
  },
  commodities: {
    'DEFAULT':                {globalSpec: {type: 'array'}, parents: {RequestedEquipmentCarrier: {items: {$ref: '#/components/schemas/CommodityCarrier'}}, RequestedEquipmentShipper: {items: {$ref: '#/components/schemas/Commodity'}} } },
  },
  Commodity: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Commodity', required: ['commodityType', 'cargoGrossWeight', 'cargoGrossWeightUnit']}, parents: {} },
  },
  CommodityCarrier: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Commodity (Carrier)', allOf: true}, parents: {} },
  },
  commoditySubreference: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 100, pattern: '^\\S(?:.*\\S)?$'}, parents: {CommodityCarrier: {}} },
  },
  commodityType: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 550, pattern: '^\\S(?:.*\\S)?$'}, parents: {Commodity: {}} },
  },
  communicationChannelCode: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 2}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}} },
  },
  competentAuthorityApproval: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 70, pattern:'^\\S(?:.*\\S)?$'}, parents: {DangerousGoods: {}} },
  },
  confirmedEquipments: {
    'DEFAULT':                {globalSpec: {type: 'array', items: {$ref: '#/components/schemas/ConfirmedEquipment'}}, parents: {Booking: {} } },
  },
  ConfirmedEquipment: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Confirmed Equipment', required: ['ISOEquipmentCode', 'units']}, parents: {} },
  },
  consignee: {
    'DEFAULT'               : {globalSpec: {$ref: '#/components/schemas/Consignee'}, parents: {documentParties: {}}},
  },
  Consignee: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Consignee', required: ['partyName']}, parents: {} },
  },
  contact: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 255}, parents: {EmergencyContactDetails: {}} },
  },
  contractQuotationReference: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 35, pattern: '^\\S(?:.*\\S)?$'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}} },
  },
  country: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 75}, parents: {address: {} }}
  },
  countryCode: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 2, minLength: 2, pattern: '^[A-Z]{2}$'}, parents: {address: {}, Address: {}, PartyAddress: {}, AdvanceManifestFiling: {}, TaxLegalReference: {}} },
  },
  CreateBooking: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Create Booking', required: ['receiptTypeAtOrigin', 'deliveryTypeAtDestination', 'cargoMovementTypeAtOrigin', 'cargoMovementTypeAtDestination', 'isPartialLoadAllowed', 'isExportDeclarationRequired', 'isImportLicenseRequired', 'communicationChannelCode', 'isEquipmentSubstitutionAllowed', 'shipmentLocations', 'requestedEquipments', 'documentParties']}, parents: {}},
  },
  currencyAmount: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float', minimum: 0}, parents: {Charge: {}} },
  },
  currencyCode: {
    'DEFAULT':                {globalSpec: {type: 'string', pattern: '^[A-Z]{3}$', minLength: 3, maxLength: 3}, parents: {Charge: {}} },
  },
  cutOffDateTime: {
    'DEFAULT':                {globalSpec: {type: 'string', format: 'date-time'}, parents: {ShipmentCutOffTime: {}} },
  },
  cutOffDateTimeCode: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 3}, parents: {ShipmentCutOffTime: {}} },
  },
  DCSAResponsibleAgencyCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', enum: ['ISO', 'UNECE', 'LLOYD', 'BIC', 'IMO', 'SCAC', 'ITIGG', 'ITU', 'SMDG', 'EXIS', 'FMC', 'CBSA', 'ZZZ'] }, parents: {identifyingCode: {} }},
  },
  dangerousGoods: {
    'DEFAULT':                {globalSpec: {type: 'array', items: {$ref: '#/components/schemas/DangerousGoods'}}, parents: {OuterPackaging: {} } },
  },
  DangerousGoods: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Dangerous Goods', oneOf: true, required: ['properShippingName', 'imoClass', 'isMarinePollutant', 'isLimitedQuantity', 'isExceptedQuantity', 'isSalvagePackings', 'isEmptyUncleanedResidue', 'isWaste', 'isHot', 'isCompetentAuthorityApprovalProvided', 'isReportableQuantity', 'emergencyContactDetails', 'grossWeight']}, parents: {} },
  },
  data: {
    DEFAULT:                  {globalSpec: {type: 'object'}, parents: {BookingNotification: {required: ['bookingStatus']}, ShippingInstructionsNotification: {required: ['shippingInstructionsStatus']}, TransportDocumentNotification: {required: ['transportDocumentStatus', 'transportDocumentReference']}} },
  },
  datacontenttype: {
    DEFAULT:                  {globalSpec: {type: 'string', enum: ['application/json']}, parents: DCSA_CLOUDEVENT_GROUP },
  },
  declaredValue: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float', minimum: 0}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}} },
  },
  declaredValueCurrency: {
    'DEFAULT':                {globalSpec: {type: 'string', minLength: 3, maxLength: 3, pattern: '^[A-Z]{3}$'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}} },
  },
  delayReasonCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 3}}
  },
  deliveryTypeAtDestination: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 3, enum: ['CY', 'SD', 'CFS']}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}} },
  },
  description: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 100}, parents: {OuterPackaging: {}, InnerPackaging: {} } },
  },
  destinationChargesPaymentTerm: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Destination Charges Payment Term'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} }, $ref: true},
  },
  dimensionUnit: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', enum: ['MTR', 'FOT']}, parent: {vessel: {}}}
  },
  dischargeLocation: {
    'DEFAULT':                {parents: {Transport: {$ref:'#/components/schemas/DischargeLocation'} } },
  },
  DischargeLocation: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Discharge Location', oneOf: true}, parents: {} },
  },
  documentParties: {
    'BKG_v2.0.0-Beta-2.yaml': {globalSpec: { type: 'object', required: ['bookingAgent']}, parents: {}},
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Document Parties'}, parents: {CreateBooking: {required: ['bookingAgent']}, UpdateBooking: {required: ['bookingAgent']}, Booking: {}}},
  },
  draft: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'number', format: 'float'}, parent: {vessel: {}}}
  },
  email: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 100, pattern: '^.+@\\S+$'} },
  },
  EmergencyContactDetails: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Emergency Contact Details', required: ['contact', 'phone']}, parents: {} },
  },
  emergencyContactDetails: {
    DEFAULT:                  {globalSpec: {$ref: '#/components/schemas/EmergencyContactDetails'}, parents: {DangerousGoods: {} } },
  },
  EMSNumber: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 7}, parents: {DangerousGoods: {}} },
  },
  endOfHoldingTime: {
    DEFAULT:                  {globalSpec: {type: 'string', format: 'date'}, parents: {DangerousGoods: {} }},
  },
  equipmentReferences: {
    DEFAULT:                  {globalSpec: {type: 'array', items: {type: 'string', maxLength: 11, pattern: '^\\S(?:.*\\S)?$'}}, parents: {RequestedEquipment: {}}},
  },
  errorDateTime: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', format: 'date-time'}},
    'DEFAULT'               : {globalSpec: {type: 'string', format: 'date-time'}, parents: {ErrorResponse: {}}},
  },
  errorCode: {
    'DEFAULT'               : {globalSpec: {type: 'integer', format: 'int32', minimum: 7000, maximum: 9999}, parents: {DetailedError: {}, errors: {}}},
  },
  errorCodeMessage: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 200}, parents: {DetailedError: {}, errors: {}}},
  },
  errorCodeText: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 100}, parents: {DetailedError: {}, errors: {}}},
  },
  ErrorResponse: {
    DEFAULT:                  {globalSpec: {type: 'object', title: 'Error Response', required: ['httpMethod', 'requestUri', 'statusCode', 'statusCodeText', 'errorDateTime', 'errors']}, parents: {} },
  },
  errors: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'array'}},
    'BKG_v2.0.0-Beta2.yaml' : {globalSpec: {type: 'array', minItems: 1, items: {}}, parents: {ErrorResponse: {}}},
    'DEFAULT'               : {globalSpec: {type: 'array', minItems: 1, items: {type: 'object', title: 'Detailed Error', required: ['errorCodeText', 'errorCodeMessage']}}, parents: {ErrorResponse: {}}},
  },
  eventClassifierCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', enum: ['PLN', 'ACT', 'REQ', 'EST']}},
  },
  eventCreatedDateTime: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', format: 'date-time'}}
  },
  eventDateTime: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', format: 'date-time'}},
    DEFAULT:                  {globalSpec: {type: 'string', format: 'date-time'}, parents: {ShipmentLocation: {} } },
  },
  eventID: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', format: 'uuid'}}
  },
  eventLocation: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'object'}},
  },
  eventType: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', enum: ['OPERATIONS']}},
  },
  expectedArrivalAtPlaceOfDeliveryStartDate: {
    DEFAULT:                  {globalSpec: {type: 'string', format: 'date'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} }},
  },
  expectedArrivalAtPlaceOfDeliveryEndDate: {
    DEFAULT:                  {globalSpec: {type: 'string', format: 'date'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} }},
  },
  expectedDepartureDate: {
    DEFAULT:                  {globalSpec: {type: 'string', format: 'date'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} }},
  },
  exportDeclarationReference: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 35, pattern: '^\\S(?:.*\\S)?$'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} }},
  },
  exportLicenseExpiryDate: {
    DEFAULT:                  {globalSpec: {type: 'string', format: 'date'}, parents: {Commodity: {} }},
  },
  exportLicenseIssueDate: {
    DEFAULT:                  {globalSpec: {type: 'string', format: 'date'}, parents: {Commodity: {} }},
  },
  exportVoyageNumber: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 50, deprecated: true}},
  },
  facilityCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 6}, parents: {TransportCall: {}, location: {nullable: false}, eventLocation: {nullable: false} }},
    'BKG_v2.0.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 6, nullable: false, pattern: '^\\S(?:.*\\S)?$'}, parents: {FacilityLocation: {} }},
    DEFAULT                 : {globalSpec: {type: 'string', maxLength: 6, pattern: '^\\S(?:.*\\S)?$'}, parents: {FacilityLocation: {} }},
  },
  FacilityLocation: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Facility Location', required: ['locationType', 'facilityCode', 'facilityCodeListProvider']}, parents: {}},
  },
  facilitySMDGCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 6}, parents: {timestamp: {nullable: false, deprecated: true} }}
  },
  facilityTypeCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string'}, parents: {timestamp: {enum: ['PBPL', 'BRTH'] }, TransportCall: {enum: ['BOCR', 'CLOC', 'COFS', 'COYA', 'OFFD', 'DEPO', 'INTE', 'POTE', 'RAMP']}}},
  },
  facilityCodeListProvider: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', enum: ['BIC', 'SMDG']}},
    DEFAULT                 : {globalSpec: {type: 'string', enum: ['BIC', 'SMDG']}, parents: {FacilityLocation: {} }},
  },
  flashPoint: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float'}, parents: {Limits: {}} },
  },
  floor: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 50}, parents: {Address: {}, address: {} }},
    DEFAULT:                  {globalSpec: {type: 'string', pattern: '^\\S(?:.*\\S)?$', maxLength: 50}, parents: {Address: {}, address: {}, PartyAddress: {} }},
  },
  freightPaymentTermCode: {
    'DEFAULT':                {globalSpec: {type: 'string', enum: ['PRE', 'COL']}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}} },
  },
  fumigationDateTime: {
    DEFAULT:                  {globalSpec: {type: 'string', format: 'date-time'}, parents: {DangerousGoods: {} } },
  },
  grossWeight: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Gross Weight', required: ['value', 'unit']}, parents: {}},
  },
  haulageChargesPaymentTermCode: {
    'DEFAULT':                {globalSpec: {type: 'string', enum: ['PRE', 'COL']}, parents: {originChargesPaymentTerm: {}, destinationChargesPaymentTerm: {}} },
  },
  HSCodes: {
    'DEFAULT':                {globalSpec: {type: 'array', items: {type: 'string', minLength: 6, maxLength: 10, pattern: '^\\d{6,10}$'}}, parents: {Commodity: {} } },
  },
  httpMethod: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string'}},
    'DEFAULT':                {globalSpec: {type: 'string', enum: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTION', 'PATCH']}, parents: {ErrorResponse: {}}},
  },
  humiditySetpoint: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float', minimum: 0, maximum: 100}, parents: {ActiveReeferSettings: {}} },
  },
  id: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 100}, parents: DCSA_CLOUDEVENT_GROUP },
  },
  IdentifyingCode: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Identifying Code', required: ['codeListProvider', 'partyCode']}, parents: {} },
  },
  identifyingCodes: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'array'}, parents: {publisher: {}}},
    DEFAULT:                  {globalSpec: {type: 'array', items: {$ref: '#/components/schemas/IdentifyingCode'}}, parents: {BookingAgent: {}, Shipper: {}, Consignee: {}, ServiceContractOwner: {}, CarrierBookingOffice: {}, Party: {} }},
  },
  imoClass: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 4}, parents: {DangerousGoods: {} } },
  },
  imoPackagingCode: {
    'DEFAULT':                {globalSpec: {type: 'string', minLength: 1, maxLength: 5, pattern: '^[A-Z0-9]{1,5}$'}, parents: {OuterPackaging: {} } },
  },
  importLicenseReference: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 35, pattern: '^\\S(?:.*\\S)?$'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} }},
  },
  importVoyageNumber: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 50, deprecated: true}},
  },
  incoTerms: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 3}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}} },
  },
  inhalationZone: {
    'DEFAULT':                {globalSpec: {type: 'string', minLength: 1, maxLength: 1}, parents: { DangerousGoods: {} } },
  },
  InnerPackaging: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Inner Packaging', required: ['quantity', 'material', 'description']}, parents: { } },
  },
  innerPackagings: {
    'DEFAULT':                {globalSpec: {type: 'array', items: {$ref: '#/components/schemas/InnerPackaging'}}, parents: {DangerousGoods: {} } },
  },
  InvoicePayableAt: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Invoice Payable At', required: ['UNLocationCode']}, parents: {} },
  },
  invoicePayableAt: {
    'BKG_v2.0.0-Beta-2.yaml': {globalSpec: {type: 'object', title: 'Invoice Payable At', required: ['UNLocationCode']}, parents: {} },//<-- Needs to be modified
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Invoice Payable At', required: ['UNLocationCode']}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} } },
  },
  isBulbMode: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {ActiveReeferSettings: {} }},
  },
  isColdTreatmentRequired: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {ActiveReeferSettings: {} }},
  },
  isCompetentAuthorityApprovalProvided: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {DangerousGoods: {} }},
  },
  isControlledAtmosphereRequired: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {ActiveReeferSettings: {} }},
  },
  isDrainholesOpen: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {ActiveReeferSettings: {} }},
  },
  isEmptyUncleanedResidue: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {DangerousGoods: {} }},
  },
  isEquipmentSubstitutionAllowed: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} }},
  },
  isExceptedQuantity: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {DangerousGoods: {} }},
  },
  isExportDeclarationRequired: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} }},
  },
  isGeneratorSetRequired: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {ActiveReeferSettings: {} }},
  },
  isHot: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {DangerousGoods: {} }},
  },
  isImportLicenseRequired: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} }},
  },
  isLimitedQuantity: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {DangerousGoods: {} }},
  },
  isMarinePollutant: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {DangerousGoods: {} }},
  },
  isNonOperatingReefer: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {RequestedEquipment: {} }},
  },
  ISOEquipmentCode: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 4, pattern: '^\\S(?:.*\\S)?$'}, parents: {ConfirmedEquipment: {}, RequestedEquipment: {}} },
  },
  isPartialLoadAllowed: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} }},
  },
  isPreCoolingRequired: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {ActiveReeferSettings: {} }},
  },
  isReportableQuantity: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {DangerousGoods: {} }},
  },
  isSalvagePackings: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {DangerousGoods: {} }},
  },
  isShipperOwned: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {SocEquipment: {}, CocEquipment: {} }},
  },
  isVentilationOpen: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {ActiveReeferSettings: {} }},
  },
  isWaste: {
    DEFAULT:                  {globalSpec: {type: 'boolean'}, parents: {DangerousGoods: {} }},
  },
  jsonPath: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 500}, parents: {RequestedChange: {}, errors: {}}},
  },
  latitude: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 10}}
  },
  lengthOverall: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'number', format: 'float'}}
  },
  Limits: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Limits', required: ['temperatureUnit']}, parents: {} },
  },
  limits: {
    'DEFAULT':                {globalSpec: {$ref: '#/components/schemas/Limits'}, parents: {DangerousGoods: {} } },
  },
  loadLocation: {
    'DEFAULT':                {parents: {Transport: {$ref:'#/components/schemas/LoadLocation'} } },
  },
  LoadLocation: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Load Location', oneOf: true}, parents: {} },
  },
  location: {
    'jit_v1.2.0-Beta-2.yaml': {parents: {TransportCall: {} }},
    DEFAULT:                  {globalSpec: {type: 'object', title: 'Location', oneOf: true}, parents: {ShipmentLocation: {}} },
  },
  locationName: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 100}, parents: {location: {}, eventLocation: {} }},
    'BKG_v2.0.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 100}, parents: {AddressLocation: {}, FacilityLocation: {pattern: '^\\S(?:.*\\S)?$'}, UNLocationLocation: {pattern: '^\\S(?:.*\\S)?$'} }},
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 100, pattern: '^\\S(?:.*\\S)?$'}, parents: {AddressLocation: {}, FacilityLocation: {}, UNLocationLocation: {} }},
  },
  locationType: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 4}, parents: {AddressLocation: {}, FacilityLocation: {}, UNLocationLocation: {} }},
  },
  locationTypeCode: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 3}, parents: {ShipmentLocation: {} }},
  },
  longitude: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 11}}
  },
  manifestTypeCode: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 50, pattern: '^\\S(?:.*\\S)?$'}, parents: {AdvanceManifestFiling: {} } },
  },
  material: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 100}, parents: {InnerPackaging: {}}}
  },
  message: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string'}, parents: {subError: {}}},
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 500}, parents: {RequestedChange: {}}},
  },
  milesToDestinationPort: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'number', format: 'float'}}
  },
  modeOfTransport: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', enum: ['VESSEL', 'RAIL', 'TRUCK', 'BARGE']}, parents: {timestamp: {deprecated: true}, TransportCall: {}}},
    '???':                    {globalSpec: {type: 'string', enum: ['VESSEL', 'RAIL', 'TRUCK', 'BARGE']}},
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 50}, parents: {Transport: {}}}
  },
  name: {
    'DEFAULT':                {globalSpec: {type: 'string', pattern: '^\\S(?:.*\\S)?$'}, parents: {vessel: {maxLength: 50}, Vessel: {maxLength: 50}, PartyContactDetail: {maxLength: 100} } },
  },
  naNumber: {
    'DEFAULT':                {globalSpec: {type: 'string', minLength: 4, maxLength: 4, pattern: '^\\d{4}$'}, parents: { } },
  },
  netExplosiveContent: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Net Explosive Content', required: ['value', 'unit']}, parents: {}},
  },
  netWeight: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Net Weight', required: ['value', 'unit']}, parents: {}},
  },
  nmftaCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 4, deprecated: true}, parents: {publisher: {} }},
  },
  numberOfPackages: {
    'DEFAULT':                {globalSpec: {type: 'integer', format: 'int32', minimum: 1}, parents: {OuterPackaging: {}} },
  },
  o2Setpoint: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float', minimum: 0, maximum: 100}, parents: {ActiveReeferSettings: {}} },
  },
  operationsEventTypeCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', enum: ['STRT', 'CMPL', 'ARRI', 'DEPA'] }},
  },
  originChargesPaymentTerm: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Origin Charges Payment Term'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}}, $ref: true},
  },
  OuterPackaging: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Outer Packaging'}, parents: {} },
  },
  outerPackaging: {
    'DEFAULT'               : {globalSpec: {$ref: '#/components/schemas/OuterPackaging'}, parents: {Commodity: {}}},
  },
  other: {
    'DEFAULT':                {globalSpec: {type: 'array', items: {$ref: '#/components/schemas/OtherDocumentParty'}}, parents: {documentParties: {} } },
  },
  otherChargesPaymentTermCode: {
    'DEFAULT':                {globalSpec: {type: 'string', enum: ['PRE', 'COL']}, parents: {originChargesPaymentTerm: {}, destinationChargesPaymentTerm: {}} },
  },
  OtherDocumentParty: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Other Document Party', required: ['party', 'partyFunction']}, parents: {} },
  },
  otherFacility: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 50}, parents: {}},
  },
  packageCode: {
    'DEFAULT':                {globalSpec: {type: 'string', minLength: 2, maxLength: 2, pattern: '^[A-Z0-9]{2}$'}, parents: {OuterPackaging: {} } },
  },
  packingGroup: {
    'DEFAULT':                {globalSpec: {type: 'integer', format: 'int32', minimum: 1, maximum: 3}, parents: {DangerousGoods: {}} },
  },
  party: {
    'DEFAULT'               : {globalSpec: {$ref: '#/components/schemas/Party'}, parents: {OtherDocumentParty: {}}},
  },
  Party: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Party', required: ['partyName']}, parents: {} },
  },
  PartyAddress: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Party Address'}, parents: {}},
  },
  partyCode: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 100}, parents: {IdentifyingCode: {}, identifyingCode: {}} },
  },
  partyContactDetails: {
    'DEFAULT':                {globalSpec: {type: 'array', items: {$ref: '#/components/schemas/PartyContactDetail'}}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}, BookingAgent: {minItems: 1}, Shipper: {minItems: 1}, Consignee: {minItems: 1}, ServiceContractOwner: {minItems: 1}, CarrierBookingOffice: {minItems: 1}, Party: {minItems: 1} } },
  },
  PartyContactDetail: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Party Contact Detail', required: ['name']}, parents: {} },
  },
  partyFunction: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 3}, parents: {OtherDocumentParty: {}} },
  },
  partyName: {
    'jit_v1.2.0-Beta-2.yaml' :{globalSpec: {type: 'string', maxLength: 100} },
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 100, pattern: '^\\S(?:.*\\S)?$'}, parents: {BookingAgent: {}, Shipper: {}, Consignee: {}, ServiceContractOwner: {}, CarrierBookingOffice: {}, Party: {}} },
  },
  paymentTermCode: {
    'DEFAULT':                {globalSpec: {type: 'string', enum: ['PRE', 'COL']}, parents: {Charge: {}} },
  },
  phone: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 30, pattern: '^\\S(?:.*\\S)?$'} , parent: {EmergencyContactDetails: {}}},
  },
  placeOfBLIssue: {
    'BKG_v2.0.0-Beta-2.yaml': {globalSpec: {type: 'object', title: 'Place of B/L Issue', required: ['UNLocationCode']}, parents: {} },//<-- Needs to be modified
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Place of B/L Issue', oneOf: true}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} } },
  },
  plannedArrivalDate: {
    'DEFAULT':                {globalSpec: {type: 'string', format: 'date'}, parents: {Transport: {} } },
  },
  plannedDepartureDate: {
    'DEFAULT':                {globalSpec: {type: 'string', format: 'date'}, parents: {Transport: {} } },
  },
  portCallPhaseTypeCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', enum: ['INBD', 'ALGS', 'SHIF', 'OUTB']}}
  },
  portCallServiceTypeCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', enum: ['PILO', 'MOOR', 'CRGO', 'TOWG', 'BUNK', 'WSDP', 'LASH', 'SAFE', 'FAST', 'GWAY']}}
  },
  portChargesPaymentTermCode: {
    'DEFAULT':                {globalSpec: {type: 'string', enum: ['PRE', 'COL']}, parents: {originChargesPaymentTerm: {}, destinationChargesPaymentTerm: {}} },
  },
  portVisitReference: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 50}}
  },
  postCode: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 50}, parents: {Address: {}, address: {}, PartyAddress: {}} },
  },
  property: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 100}, parents: {ErrorResponse: {}, RequestedChange: {}, errors: {}}},
  },
  provider: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 255}, parents: {EmergencyContactDetails: {}} },
  },
  properShippingName: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 250}, parents: {DangerousGoods: {} } },
  },
  providerCorrelationReference: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 100}, parents: {ErrorResponse: {}} },
  },
  publicKey: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 500} },
  },
  publisher: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {$ref: true } },
  },
  publisherRole: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', enum: ['CA', 'AG', 'VSL', 'ATH', 'PLT', 'TR', 'TWG', 'LSH', 'BUK'] } },
  },
  quantity: {
    'DEFAULT':                {globalSpec: {}, parents: {InnerPackaging: {type: 'integer', format: 'int32'}, Charge: {type: 'number', format: 'float', minimum: 0}} },
  },
  reason: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string'}, parents: {subError: {}}},
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 5000}, parents: {Booking: {}, data: {}, BookingRefStatus: {}, BookingRefCancelledStatus: {}}}, //BKG NTF 2.0.0 Beta 1 + EBL NTF 3.0.0 Beta 1
  },
  Reference: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Reference', required: ['type', 'value']}, parents: {}},
  },
  remark: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 500}},
  },
  receiptTypeAtOrigin: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 3, enum: ['CY', 'SD', 'CFS']}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}} },
  },
  referenceNumber: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 255}, parents: {EmergencyContactDetails: {}} },
  },
  references: {
    'DEFAULT':                {globalSpec: {type: 'array', items: {$ref: '#/components/schemas/Reference'}}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}, RequestedEquipment: {}, Commodity: {} } },
  },
  replyToTimestampID: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', format: 'uuid'} },
  },
  RequestedChange: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Requested Change', required: ['message']}, parents: {} },
  },
  requestedChanges: {
    'DEFAULT':                {globalSpec: {type: 'array', items: {$ref: '#/components/schemas/RequestedChange'}}, parents: {Booking: {}, BookingRefStatus: {}, BookingRefCancelledStatus: {} } },
  },
  RequestedEquipment: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Requested Equipment', required: ['ISOEquipmentCode', 'units'], oneOf: true}, parents: {} },
  },
  RequestedEquipmentCarrier: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Requested Equipment (Carrier)', allOf: true}, parents: {} },
  },
  RequestedEquipmentShipper: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Requested Equipment (Shipper)', allOf: true}, parents: {} },
  },
  requestedEquipments: {
    'DEFAULT':                {globalSpec: {type: 'array', minItems: 1}, parents: {CreateBooking: {items: {$ref: '#/components/schemas/RequestedEquipmentShipper'}}, UpdateBooking: {items: {$ref: '#/components/schemas/RequestedEquipmentShipper'}}, Booking: {items: {$ref: '#/components/schemas/RequestedEquipmentCarrier'}} } },
  },
  requestUri: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string'} },
    'DEFAULT':                {globalSpec: {type: 'string'}, parents: {ErrorResponse: {}} },
  },
  SADT: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float'}, parents: {Limits: {}} },
  },
  SAPT: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float'}, parents: {Limits: {}} },
  },
  segregationGroups: {
    DEFAULT:                  {globalSpec: {type: 'array', items: {type: 'string', maxLength: 2}}, parents: {DangerousGoods: {}}},
  },
  serviceContractOwner: {
    'DEFAULT'               : {globalSpec: {$ref: '#/components/schemas/ServiceContractOwner'}, parents: {documentParties: {}}},
  },
  ServiceContractOwner: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Service Contract Owner', required: ['partyName']}, parents: {} },
  },
  serviceContractReference: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 30}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}} },
  },
  shipmentCutOffTimes: {
    'DEFAULT':                {globalSpec: {type: 'array', items: {$ref: '#/components/schemas/ShipmentCutOffTime'}}, parents: {Booking: {} } },
  },
  ShipmentCutOffTime: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Shipment Cut-Off Time', required: ['cutOffDateTimeCode', 'cutOffDateTime']}, parents: {} },
  },
  ShipmentLocation: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Shipment Location', required: ['location', 'locationTypeCode']}, parents: {}},
  },
  shipmentLocations: {
    'DEFAULT':                {globalSpec: {type: 'array', minItems: 1, items: {$ref: '#/components/schemas/ShipmentLocation'}}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} } },
  },
  shipper: {
    'DEFAULT'               : {globalSpec: {$ref: '#/components/schemas/Shipper'}, parents: {documentParties: {}}},
  },
  Shipper: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Shipper', required: ['partyName']}, parents: {} },
  },
  ShippingInstructionsNotification: {
    'ebl_ntf_v3.0.0-Beta-1.yaml': {globalSpec: { type: 'object', title: 'Shipping Instructions Notification', required: ['specversion', 'id', 'source', 'type', 'time', 'datacontenttype', 'data']}, parents: {}},
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Shipping Instructions Notification', required: ['specversion', 'id', 'source', 'type', 'time', 'datacontenttype', 'subscriptionReference', 'data']}, parents: {}},
  },
  shippingInstructionsReference: {
    'ebl_ntf_v3.0.0-Beta-1.yaml': {globalSpec: {type: 'string', maxLength: 100, pattern: "^\\S+(\\s+\\S+)*$"}, parents: {data: {} } }, //BKG NTF 2.0.0 Beta 1
    'EBL_NTF_v3.0.0-Beta-2.yaml':{globalSpec: {type: 'string', maxLength: 100, pattern: '^\\S(?:.*\\S)?$'}, parents: {data: {} } },
    'EBL_NTF_v3.0.0-Beta-3.yaml':{globalSpec: {type: 'string', maxLength: 100, pattern: '^\\S(?:.*\\S)?$'}, parents: {data: {} } },
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 100, pattern: '^\\S(?:.*\\S)?$'}, parents: {ShippingInstructions: {} } },
  },
  shippingInstructionsStatus: {
    'ebl_ntf_v3.0.0-Beta-1.yaml': {globalSpec: { type: 'string', maxLength: 50}, parents: {data: {}}},
    'EBL_NTF_v3.0.0-Beta-2.yaml': {globalSpec: { type: 'string', maxLength: 50}, parents: {data: {}}},
    'EBL_NTF_v3.0.0-Beta-3.yaml': {globalSpec: { type: 'string', maxLength: 50}, parents: {data: {}}},
    DEFAULT:                  {globalSpec: { type: 'string', maxLength: 50}, parents: {ShippingInstructions: {} }},
  },
  SocEquipment: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Shipper owned Equipment', required: ['tareWeight', 'tareWeightUnit', 'isShipperOwned']}, parents: {} },
  },
  source: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 4096}, parents: DCSA_CLOUDEVENT_GROUP },
  },
  specialCertificateNumber: {
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 255}, parents: {DangerousGoods: {}}},
  },
  specversion: {
    DEFAULT:                  {globalSpec: {type: 'string', enum: ['1.0']}, parents: DCSA_CLOUDEVENT_GROUP },
  },
  stateRegion: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 65}, parents: {address: {} }},
    'BKG_v2.0.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 65, nullable: true} },
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 65}, parents: {Address:{}, address: {}, PartyAddress: {}} },
  },
  statusCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'integer'}},
    'DEFAULT':                {globalSpec: {type: 'integer', format: 'int32'}, parents: {ErrorResponse: {}} },
  },
  statusCodeMessage: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 200}, parents: {ErrorResponse: {}} },
  },
  statusCodeText: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string'}},
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 50}, parents: {ErrorResponse: {}} },
  },
  street: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 100}, parents: {Address: {}, address: {}, PartyAddress: {}} },
  },
  streetNumber: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 50}, parents: {Address: {}, address: {}, PartyAddress: {}} },
  },
  subscriptionReference: {
    DEFAULT:                  {globalSpec: {type: 'string', pattern: '^\\S(?:.*\\S)?$', maxLength: 100}, parents: DCSA_CLOUDEVENT_GROUP },
  },
  subsidiaryRisk1: {
    'DEFAULT':                {globalSpec: {type: 'string', minLength: 1, maxLength: 3, pattern: '^[0-9](\\.[0-9])?$'}, parents: {DangerousGoods: {} } },
  },
  subsidiaryRisk2: {
    'DEFAULT':                {globalSpec: {type: 'string', minLength: 1, maxLength: 3, pattern: '^[0-9](\\.[0-9])?$'}, parents: {DangerousGoods: {} } },
  },
  tareWeight: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float', minimum: 0, exclusiveMinimum: true}, parents: {SocEquipment: {}} },
  },
  tareWeightUnit: {
    'DEFAULT':                {globalSpec: {type: 'string', enum: ['KGM', 'LBR']}, parents: {SocEquipment: {} } },
  },
  TaxLegalReference: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Tax & Legal Reference', required: ['type', 'countryCode', 'value']}, parents: {} },
  },
  taxLegalReferences: {
    DEFAULT:                  {globalSpec: {type: 'array', items: {$ref: '#/components/schemas/TaxLegalReference'}}, parents: {BookingAgent: {}, Shipper: {}, Consignee: {}, ServiceContractOwner: {}, Party: {} }},
  },
  taxReference1: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 20} },
  },
  taxReference2: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 20} },
  },
  technicalName: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 250}, parents: {DangerousGoods: {} } },
  },
  temperatureSetpoint: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float'}, parents: {ActiveReeferSettings: {}} },
  },
  temperatureUnit: {
    'DEFAULT':                {globalSpec: {type: 'string', enum: ['CEL', 'FAH']}, parents: {ActiveReeferSettings: {}, Limits: {} } },
  },
  termsAndConditions: {
    'DEFAULT':                {globalSpec: {type: 'string', maxLength: 50000}, parents: {Booking: {}} },
  },
  time: {
    DEFAULT:                  {globalSpec: {type: 'string', format: 'date-time'}, parents: DCSA_CLOUDEVENT_GROUP },
  },
  timestampID: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', format: 'uuid'} },
  },
  Transport: {
    'DEFAULT':                {globalSpec: {type: 'object', title: 'Transport', required: ['transportPlanStage', 'transportPlanStageSequenceNumber', 'loadLocation', 'dischargeLocation', 'plannedDepartureDate', 'plannedArrivalDate']}, parents: {} },
  },
  transportCallID: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 100}, parents: {TransportCall: {}} },
  },
  transportCallReference: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 100} },
  },
  transportCallSequenceNumber: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'integer'}},
    'DEFAULT':                {globalSpec: {type: 'integer', format: 'int32'} },
  },
  transportControlTemperature: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float'}, parents: {Limits: {}} },
  },
  TransportDocumentNotification: {
    'ebl_ntf_v3.0.0-Beta-1.yaml': {globalSpec: { type: 'object', title: 'Transport Document Notification', required: ['specversion', 'id', 'source', 'type', 'time', 'datacontenttype', 'data']}, parents: {}},
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Transport Document Notification', required: ['specversion', 'id', 'source', 'type', 'time', 'datacontenttype', 'subscriptionReference', 'data']}, parents: {}},
  },
  transportDocumentReference: {
    'ebl_ntf_v3.0.0-Beta-1.yaml': {globalSpec: {type: 'string', maxLength: 20, pattern: "^\\S+(\\s+\\S+)*$"}, parents: {data: {} } }, //BKG NTF 2.0.0 Beta 1
    'EBL_NTF_v3.0.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 20, pattern: '^\\S(?:.*\\S)?$'}, parents: {data: {} }},
    'EBL_NTF_v3.0.0-Beta-3.yaml': {globalSpec: {type: 'string', maxLength: 20, pattern: '^\\S(?:.*\\S)?$'}, parents: {data: {} }},
    DEFAULT                 : {globalSpec: {type: 'string', maxLength: 20, pattern: '^\\S(?:.*\\S)?$'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} }},
  },
  transportDocumentStatus: {
    'ebl_ntf_v3.0.0-Beta-1.yaml': {globalSpec: { type: 'string', maxLength: 50}, parents: {data: {}}},
    'EBL_NTF_v3.0.0-Beta-2.yaml': {globalSpec: { type: 'string', maxLength: 50}, parents: {data: {}}},
    'EBL_NTF_v3.0.0-Beta-3.yaml': {globalSpec: { type: 'string', maxLength: 50}, parents: {data: {}}},
    DEFAULT:                  {globalSpec: { type: 'string', maxLength: 50}, parents: {TransportDocument: {} }},
  },
  transportDocumentTypeCode: {
    DEFAULT                 : {globalSpec: {type: 'string', enum: ['BOL', 'SWB']}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} }},
  },
  transportEmergencyTemperature: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float'}, parents: {Limits: {}} },
  },
  transportPlan: {
    'DEFAULT':                {globalSpec: {type: 'array', items: {$ref: '#/components/schemas/Transport'}}, parents: {Booking: {} } },
  },
  transportPlanStage: {
    DEFAULT                 : {globalSpec: {type: 'string', enum: ['PRC', 'MNC', 'ONC']}, parents: {Transport: {} }},
  },
  transportPlanStageSequenceNumber: {
    'DEFAULT':                {globalSpec: {type: 'integer', format: 'int32'}, parents: {Transport: {}} },
  },
  type: {
    DEFAULT:                  {globalSpec: {type: 'string'}, parents: {Reference: {maxLength: 3}, TaxLegalReference: {maxLength: 50, pattern: '^\\S(?:.*\\S)?$'}, ArrivalNoticeNotification: {enum: ['org.dcsa.arrival-notice-notification.v1']}, BookingNotification: {enum: ['org.dcsa.booking-notification.v2']},TransportDocumentNotification: {enum: ['org.dcsa.transport-document-notification.v3']}, ShippingInstructionsNotification: {enum: ['org.dcsa.shipping-instructions-notification.v3']}, vessel: {enum: ['GCGO', 'CONT', 'RORO', 'CARC', 'PASS', 'FERY', 'BULK', 'TANK', 'LGTK', 'ASSI', 'PILO']} } },
  },
  unit: {
    'DEFAULT'               : {globalSpec: { type: 'string'}, parents: {volume: {enum: ['MTQ', 'FTQ', 'LTR']}, grossWeight: {enum: ['KGM', 'LBR']}, netWeight: {enum: ['KGM', 'LBR']}, netExplosiveContent: {enum: ['KGM', 'GRM']} }},
  },
  units: {
    'DEFAULT':                {globalSpec: {type: 'integer', format: 'int32', minimum: 1}, parents: {ConfirmedEquipment: {}, RequestedEquipment: {}} },
  },
  unitPrice: {
    'DEFAULT':                {globalSpec: {type: 'number', format: 'float', minimum: 0}, parents: {Charge: {}} },
  },
  universalExportVoyageReference: {
    'DEFAULT':                {globalSpec: {type: 'string', minLength: 5, maxLength: 5, pattern: '^\\d{2}[0-9A-Z]{2}[NEWSR]$'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}, Transport: {}} },
  },
  universalImportVoyageReference: {
    'DEFAULT':                {globalSpec: {type: 'string', minLength: 5, maxLength: 5, pattern: '^\\d{2}[0-9A-Z]{2}[NEWSR]$'}, parents: {Transport: {}} },
  },
  universalServiceReference: {
    'DEFAULT':                {globalSpec: {type: 'string', minLength: 8, maxLength: 8, pattern: '^SR\\d{5}[A-Z]$'}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {}, Transport: {}} },
  },
  UNLocationCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 5}},
    'DEFAULT':                {globalSpec: {type: 'string', minLength: 5, maxLength: 5, pattern: '^[A-Z]{2}[A-Z2-9]{3}$'}, parents: {invoicePayableAt: {}, InvoicePayableAt: {}, FacilityLocation: {}, UNLocationLocation: {}, PartyAddress: {}, CarrierBookingOffice: {} } },
  },
  UNLocationLocation: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'UNLocation Location', additionalProperties: false, required: ['locationType', 'UNLocationCode']}, parents: {}},
  },
  unNumber: {
    'DEFAULT':                {globalSpec: {type: 'string', minLength: 4, maxLength: 4, pattern: '^\\d{4}$'}, parents: { } },
  },
  UpdateBooking: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Update Booking', required: ['receiptTypeAtOrigin', 'deliveryTypeAtDestination', 'cargoMovementTypeAtOrigin', 'cargoMovementTypeAtDestination', 'isPartialLoadAllowed', 'isExportDeclarationRequired', 'isImportLicenseRequired', 'communicationChannelCode', 'isEquipmentSubstitutionAllowed', 'shipmentLocations', 'requestedEquipments', 'documentParties']}, parents: {}},
  },
  updatedShippingInstructionsStatus: {
    'ebl_ntf_v3.0.0-Beta-1.yaml': {globalSpec: { type: 'string', maxLength: 50}, parents: {data: {}}},
    'EBL_NTF_v3.0.0-Beta-2.yaml': {globalSpec: { type: 'string', maxLength: 50}, parents: {data: {}}},
    'EBL_NTF_v3.0.0-Beta-3.yaml': {globalSpec: { type: 'string', maxLength: 50}, parents: {data: {}}},
    DEFAULT:                  {globalSpec: { type: 'string', maxLength: 50}, parents: {ShippingInstructions: {} }},
  },
  value: {
    DEFAULT:                  {globalSpec: {}, parents: {volume: {type: 'number', format: 'float', minimum: 0, exclusiveMinimum: true}, grossWeight: {type: 'number', format: 'float', minimum: 0, exclusiveMinimum: true}, netWeight: {type: 'number', format: 'float', minimum: 0, exclusiveMinimum: true}, netExplosiveContent: {type: 'number', format: 'float', minimum: 0, exclusiveMinimum: true}, DetailedError: {type: 'string', maxLength: 500}, errors: {type: 'string', maxLength: 500}, TaxLegalReference: {type: 'string', maxLength: 100, pattern: '^\\S(?:.*\\S)?$'}, Reference: {type: 'string', maxLength: 100}} },
  },
  vessel: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'object'}, parents: {timestamp: {}, TransportCall: {} }, $ref: true },
    DEFAULT                 : {globalSpec: {type: 'object', title: 'Vessel', required: ['name']}, parents: {CreateBooking: {}, UpdateBooking: {}, Booking: {} }, $ref: true },
  },
  vesselCallSignNumber: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 10}, parents: {vessel: {} } },
  },
  vesselDraft: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'number', format: 'float'}, parents: {OperationsEvent: {} } },
  },
  vesselDraftUnit: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', enum: ['MTR', 'FOT']}, parents: {OperationsEvent: {} } },
  },
  vesselFlag: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 2}, parents: {vessel: {} } },
  },
  vesselIMONumber: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 7}, parents: {timestamp: {deprecated: true}, vessel: {} }},
    'DEFAULT':                {globalSpec: {type: 'string', minLength: 7, maxLength: 8, pattern: '^\\d{7,8}$'}, parents: {vessel: {}, Vessel: {}, Transport: {} } },
  },
  vesselName: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 35}, parents: {vessel: {} } },
    DEFAULT:                  {globalSpec: {type: 'string', maxLength: 50, pattern: '^\\S(?:.*\\S)?$'}, parents: {Transport: {}}}
  },
  vesselOperatorCarrierCode: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', maxLength: 10, nullable: false}, parents: {vessel: {} } },
  },
  vesselOperatorCarrierCodeListProvider: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'string', enum: ['SMDG', 'NMFTA'], nullable: false}, parents: {vessel: {} } },
  },
  vesselPosition: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {$ref: true } },
  },
  volume: {
    'DEFAULT'               : {globalSpec: { type: 'object', title: 'Volume', required: ['value', 'unit']}, parents: {}},
  },
  width: {
    'jit_v1.2.0-Beta-2.yaml': {globalSpec: {type: 'number', format: 'float'}, parents: {vessel: {} }},
  },
};

// Makes sure two arrays are equal if:
// * they are the same array
// * they have the same size
// * items on each position in the list are the same
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// input:         the property (Node) in the API to validate
// propertyName:  the name of the property being tested (can be a simpleType or an object)
// attribute:     the attribute to test (type, minLength, required, etc...) if specified correctly
// requirements:  the list of attributes that from the Spectral rule that is valid
// results:       an accumulated list of errors for a particular property
function checkRequirement(input, propertyName, attribute, requirements, results) {
  // Checking 'enum' attribute
  if (attribute === 'enum') {
    // Check that enum values match (= are specified the same way...)
    const enumValuesRequired = requirements[attribute];
    const enumValues = input[attribute];
    if (!arraysEqual(enumValues, enumValuesRequired)) {
      // The two enum lists do not match - file an error
      results.push( { message: propertyName + `.` + attribute + ` value must equal: [` + enumValuesRequired + `], value provided: [` + enumValues + `]`, }, );
    }
    // Checking 'required' attribute
  } else if (attribute === 'required') {
    // Check that required lists match (= are specified the same way...)
    const requiredValues = requirements[attribute];
    const inputValues = input[attribute];
    if (!arraysEqual(inputValues, requiredValues)) {
      // The two required lists do not match - file an error
      results.push( { message: propertyName + `.` + attribute + ` value must equal: [` + requiredValues + `], value provided: [` + inputValues + `]`, }, );
    }
    // Checking 'items' attribute
  } else if (attribute === 'items') {
    if (input['items'] && requirements['items']) {
      // Check if a $ref MUST be used
      if (Object.keys(input['items']).length === 1 && input['items']['$ref']) {
        // the input contains a $ref
        if (requirements['items']['$ref'] !== input['items']['$ref']) {
          results.push( { message: propertyName + `.` + attribute + ` is defined as a $ref pointing to '` + input['items']['$ref'] + `' - but must be defined ` + (requirements['items']['$ref'] ? `as a $ref pointing to: ` + requirements['items']['$ref'] : `inline`), }, );
        }
      } else if (Object.keys(requirements['items']).length === 1 && requirements['items']['$ref']) {
        // the spec requires a $ref
        if (input['items']['$ref'] !== requirements['items']['$ref']) {
          results.push( { message: propertyName + `.` + attribute + ` is not defined as a $ref and MUST point to: ` + requirements['items']['$ref'], }, );
        }
      } else {
        // Multiple properties defined for an inline defined items
        for (const attribute2 of ATTRIBUTES_TO_CHECK) {
          checkRequirement(input.items, propertyName + '.items', attribute2, requirements.items, results)
        }
      }
    } else {
      if (input['items']) {
        // input.items is defined - but it is not part of the required properties
        results.push( { message: propertyName + `.` + attribute + ` value defined but shouldn't be according to the rules`, }, );
      } else if (requirements['items']) {
        // requirements.items is defined - but it is not part of the input properties
        results.push( { message: propertyName + `.` + attribute + ` value is missing - MUST be defined`, }, );
      }
    }
    // Checking a specific attribute
  } else if (requirements[attribute] !== input[attribute]) {
    // The value provided and the value required does not match - file an error
    results.push( { message: propertyName + `.` + attribute + ` value must equal: ` + requirements[attribute] + `, value provided: ` + input[attribute], }, );
  }

  // Make sure type attributes that are strings have example attribute value set
  if (attribute === 'type' && requirements[attribute] === "string" && (!input['example'] || input['example'].length === 0)) {
    // Example value missing when type=string - file an error
    results.push( { message: propertyName + `.example attribute must be set with a value`, }, );
  }
}

// globalSpec:    the Spectral spec to validate against in all uses of a property
// propertyName:  the name of the property being tested (can be a simpleType or an object)
// input:         the property (Node) in the API to validate
// parentSpec:    the Spectral spec to validate against when located under a particular parent property (if any)
// parentPropertyName: name of the parent property (if any). If present - it is always the name of an object (can be defined inline (defined as camelCase) or on root level as an object (defined as PascalCase))
// results:       an accumulated list of errors for a particular property
function checkAttributeRequirements(globalSpec, propertyName, input, parentSpec, parentPropertyName, results) {
  // Test valid $ref specifications
  if (input && Object.keys(input).length === 1 && input['$ref']) {
    // Make sure correct use of $ref is used
    if (parentSpec && parentSpec['$ref']) {
      if (parentSpec['$ref'] !== input['$ref']) {
        results.push({ message: propertyName + ` - if not defined inline it MUST use a $ref pointing to: ` + parentSpec['$ref'] + ` (currently pointing to: ` + input['$ref'] +`)`, }, );
      }
    } else if (globalSpec && globalSpec['$ref']) {
      if (globalSpec['$ref'] !== input['$ref']) {
        results.push({ message: propertyName + ` - if not defined inline it MUST use a $ref pointing to: ` + globalSpec['$ref'] + ` (currently pointing to: ` + input['$ref'] +`)`, }, );
      }
    } else {
      // The attribute exists only in the API - NOT as a Spectral rule - file an error
      results.push( { message: propertyName + `.$ref is specified - but should be removed as it is not a required attribute`, }, );
    }
    // Don't validate anything else - if specified using a $ref - it must match and nothing else
    return [];
  }

  for (const attribute of ATTRIBUTES_TO_CHECK) {
    if (input && input[attribute]) {
      // The attribute exists in the Spec

      if (parentSpec && parentSpec[attribute]) {
        checkRequirement(input, propertyName, attribute, parentSpec, results);
      } else if (globalSpec && globalSpec[attribute]) {
        checkRequirement(input, propertyName, attribute, globalSpec, results);
      } else {
        // The attribute exists only in the API - NOT in the current nor parent Spectral rule - file an error
        results.push( { message: propertyName + `.` + attribute + ` is specified - but should be removed as it is not a required attribute`, }, );
      }
    } else if (parentSpec && parentSpec[attribute]) {
      // The attribute exists in the parent Spectral rule - NOT in the API
      if (attribute === 'enum' || attribute === 'required') {
        // Provide better error message for missing enum
        results.push( { message: propertyName + `.` + attribute + ` must contain the list: [` + parentSpec[attribute] + `] when defined under the parent property: ` + parentPropertyName + ` but nothing was provided`, }, );
      } else {
        results.push( { message: propertyName + `.` + attribute + ` value must equal: ` + parentSpec[attribute] + ` when defined under the parent property: ` + parentPropertyName + ` but nothing was provided`, }, );
      }
    } else if (globalSpec && globalSpec[attribute]) {
      // The attribute exists in the global Spectral rule - NOT in the API
      if (attribute === 'enum' || attribute === 'required') {
        // Provide better error message for missing enum
        results.push( { message: propertyName + `.` + attribute + ` must contain the list: [` + globalSpec[attribute] + `] but nothing was provided`, }, );
      } else {
        results.push( { message: propertyName + `.` + attribute + ` value must equal: ` + globalSpec[attribute] + ` but nothing was provided`, }, );
      }
    } else {
      // In none of the lists - there is no requirement for this attribute
    }
  }
}

// property:      the Spectral spec to validate against
// propertyName:  the name of the property being tested (can be a simpleType or an object)
// input:         the property (Node) in the API to validate
// context:       a StopLight object containing metadata about the API property being tested
function checkStandard(property, propertyName, input, context) {
  // Gather all errors in results
  const results = [];

  // Test if there are any parent attribute requirements
  let parents = property['parents'];
  // If parent is defined - the required attributes only apply under a parent
  if (parents && Object.keys(parents).length > 0) {

    // Get parent to DCSA_property (if parent is called 'items' then check grandParent as the object might be defined "inline")
    const parentPropertyName = (context.path.length > 3 && context.path[context.path.length - 3] === 'items') ? context.path[context.path.length - 4] : context.path[context.path.length - 3];

    if (parents[parentPropertyName]) {
      // Check parent requirements
      checkAttributeRequirements(property['globalSpec'], propertyName, input, parents[parentPropertyName], parentPropertyName, results);
    } else {
      // The attribute MUST exist below one of the specified parents - if located elsewhere it is an error
      return [ { message: propertyName + ` is only allowed under one of these parents: [` + Object.keys(parents) + `] - was found under: ` + parentPropertyName, }, ];
    }
  } else {
    // No parent is defined - so the check applies to all locations
    checkAttributeRequirements(property['globalSpec'], propertyName, input, null, null, results);
  }

  return results;
}

function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

function isEmptyObject(value) {
  if (value == null) {
    // null or undefined
    return false;
  }

  if (typeof value !== 'object') {
    // boolean, number, string, function, etc.
    return false;
  }

  const proto = Object.getPrototypeOf(value);

  // consider `Object.create(null)`, commonly used as a safe map
  // before `Map` support, an empty object as well as `{}`
  if (proto !== null && proto !== Object.prototype) {
    return false;
  }

  return isEmpty(value);
}

export default createRulesetFunction(
    {
      input: null,
      options: null,
    },
    function checkRequirements(input, options, context) {
      // Get propertyName to check based on the path in the Context
      const propertyName = context.path[[context.path.length - 1]];

      // Get the Standard being tested (this includes the '.yaml' e.g.: jit_v1.2.0-Beta-2.yaml
      const standard = context['document']['source'].substring(context['document']['source'].lastIndexOf('/') + 1);

      // Check if the standard is in the list of standards that is currently covered by Spectral
      if (COVERED_STANDARDS.has(standard)) {
        // Get the property in the list of DCSA_PROPERTIES
        let property = DCSA_PROPERTIES[propertyName];
        if (property) {
          // Test if the property is defined for a predefined standard
          if (property[standard]) {
            // Explicitly check if a property needs to be removed if present in the API (this is the case if the spec specifies it as empty "{}")
            if (!isEmptyObject(property[standard])) {
              // Check against the matched standard
              const results = checkStandard(property[standard], propertyName, input, context);

              // Only return a list if it contains something - StopLight requirement!!
              if (results.length > 0) {
                return results;
              }
            } else {
              return [ { message: propertyName + ` is not defined for the current standard: ` + standard + ` it MUST be removed`, }, ];
            }
          } else if (property['DT_BETA2_GROUP'] && EBL_BETA2_GROUP[standard]) {
            // Check against a group in order not to specify the same spec for a large number of APIs
            const results = checkStandard(property['DT_BETA2_GROUP'], propertyName, input, context);
            //   // Only return a list if it contains something - StopLight requirement!!
            if (results.length > 0) {
              return results;
            }
          } else if (property['DEFAULT']) {
            // Check against the DEFAULT standard
            const results = checkStandard(property['DEFAULT'], propertyName, input, context);

            // Only return a list if it contains something - StopLight requirement!!
            if (results.length > 0) {
              return results;
            }
          } else {
            return [ { message: propertyName + ` is not defined for the current standard: ` + standard + ` nor does a DEFAULT standard exist. Current standard is: ` + standard, }, ];
          }
        } else {
          // the property name not part of DCSA_PROPERTIES
          return [ { message: propertyName + ` is not in the list of DCSA approved property names`, }, ];
        }
      }
    }
);
