import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ContractForm from '../../modules/contract-form';
import ContractFile from '../../modules/resource/loanchain.sol';
import BlockChain from '../../lib/blockchain';

class UserLoanStatus extends Component {

    constructor(props) {
        super(props);
        
        //TODO find the right way to find the key from search
        this.loanAddress = props.location.search.replace('?loan=','');

        this.state = {
            invalidLoanInformation: false,
            loanInfo: undefined,
            loanAddress: this.loanAddress,
            applicantAddress: '',
            loanApproved: '',
            estimatedEMI: '',
            estimatedIntrestRate: '',
            goodCredit: '',
            loanAmount: '',
            loanPeriodInYears: '',
            loanProgramAddress: '',
            loanType: '',
            loanReceived: '',
            applicant: undefined,
            name: '',
            sex: '',
            dob: '',
            zip: '',
            income: '',
            loanProgram: undefined,
            loanProgramName: ''
        }

        this.compiledObject = undefined;
        this.resolveSubmitLoan = undefined;

        this.onCompilationComplete = this.onCompilationComplete.bind(this);
        this.onLoanInfoFound = this.onLoanInfoFound.bind(this);
        this.onLoanProcess = this.onLoanProcess.bind(this);
    }

    onLoanProcess(formData) {
        return new Promise((resolve) => {
            resolve('success');
        });
    }

    onLoanInfoFound(loanInfo) {

        if(loanInfo.address) {
            
            this.setState({
                loanInfo,
                loanAddress: loanInfo.address,
                applicantAddress: loanInfo.applicantContractAddress(),
                loanApproved: loanInfo.approved(),
                estimatedEMI: loanInfo.estimatedEMI(),
                estimatedIntrestRate: loanInfo.estimatedIntrestRate(),
                goodCredit: loanInfo.goodCredit(),
                loanAmount: loanInfo.loanAmount(),
                loanPeriodInYears: loanInfo.loanPeriodInYears(),
                loanProgramAddress: loanInfo.loanProgramAddress(),
                loanType: loanInfo.loanType(),
                loanReceived: loanInfo.received()
            });

            BlockChain.getContract(this.compiledObject,':Applicant', loanInfo.applicantContractAddress()).then((applicant) => {
                const applicantInfo = applicant.getApplicantDetails();
                console.log('applicantInfo', applicantInfo);
                this.setState({
                    applicant: applicant,
                    name: applicantInfo[0],
                    sex: applicantInfo[1],
                    dob: applicantInfo[2],
                    zip: applicantInfo[3],
                    income: applicantInfo[4]
                });
            }).catch((error) => {
                this.setState({
                    applicant: undefined,
                    invalidLoanInformation: true
                });
            });
            
            BlockChain.getContract(this.compiledObject,':LoanProgram', loanInfo.loanProgramAddress()).then((loanProgram) => {
                console.log('loanProgram', loanProgram);
                this.setState({
                    loanProgram,
                    loanProgramName: loanProgram.name()
                });
            }).catch((error) => {
                this.setState({
                    loanProgram: undefined,
                    invalidLoanInformation: true
                });
            });            

        }
    }

    onCompilationComplete(compiledObject, componentState) {
        
        const { loanAddress } = this.state;  

        this.compiledObject = compiledObject;

        BlockChain.getContract(compiledObject, ':Loan', loanAddress).then((loanInfo) => {
            console.log('loanInfo', loanInfo)
            loanInfo.loanType();
            this.onLoanInfoFound(loanInfo);
        }).catch((error) => {
            console.log('error', error);
            this.setState({
                loanInfo: undefined,
                invalidLoanInformation: true
            });
        });
        
    }    

    render() {
        const { 
            loanAddress, invalidLoanInformation,
            applicantAddress, loanApproved,
            estimatedEMI, estimatedIntrestRate,
            goodCredit, loanAmount,
            loanPeriodInYears, loanProgramAddress,
            loanType, loanReceived,
            name, sex, dob, zip, income, loanProgramName } = this.state,            
            props = {
                contractFile : ContractFile,
                moduleTitle: 'Loan status',
                contractName: ':Loan',
                processCommandText: 'Ok',
                form: {   
                    loanAddress: {title: 'Loan Reference' , value: loanAddress, readOnly: true},
                    loanApproved: {title: 'Approval status' , value: loanApproved ? 'Approved' : 'In process', readOnly: true},
                    estimatedEMI: {title: 'Emi estimation' , value: estimatedEMI, readOnly: true},
                    estimatedIntrestRate: {title: 'Intrest rate estimation' , value: estimatedIntrestRate, readOnly: true},
                    goodCredit: {title: 'Credit status' , value: goodCredit, readOnly: true},
                    loanAmount: {title: 'Loan Amount' , value: loanAmount, readOnly: true},
                    loanPeriodInYears: {title: 'Repayment period' , value: loanPeriodInYears, readOnly: true},
                    loanType: {title: 'Loan type' , value: loanType, readOnly: true},
                    loanReceived: {title: 'Loan received status' , value: loanReceived ? 'Received' : 'Not received', readOnly: true}
                },
                associateForm: {   
                    loanProgramAddress: {title: 'Loan Program reference' , value: loanProgramAddress, readOnly: true},
                    loanProgram: {title: 'Loan Program' , value: loanProgramName, readOnly: true},
                    applicantAddress: {title: 'Applicant Reference' , value: applicantAddress, readOnly: true},
                    name: {title: 'Name' , value: name, readOnly: true},
                    sex: {title: 'Sex', value: sex, readOnly: true},
                    dob: {title: 'DOB', value: dob, readOnly: true},
                    zip: {title: 'Zip', value: zip, readOnly: true},
                    income: {title: 'Annual Income', value: income, readOnly: true}
                }
            }        
        return <div>
            {(!invalidLoanInformation) && <ContractForm { ...props } onCompilationComplete = { this.onCompilationComplete } onSubmit = { this.onLoanProcess } />}
            {invalidLoanInformation && <p align="center">
                Not a valid loan or loan not found<br />
                <Link to = '/'>Apply new loan</Link>
            </p>}
        </div>
    }
}

export default UserLoanStatus;