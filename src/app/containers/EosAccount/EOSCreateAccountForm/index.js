import intl from 'react-intl-universal';
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Modal, Button, Form, Input, Select, message, Tooltip } from 'antd';
import style from './index.less';
import { BigNumber } from 'bignumber.js';

const { Option } = Select;
const DEFAULT_ACCOUNT_NAME = 'eosnewyorkio';
@inject(stores => ({
    language: stores.languageIntl.language,
    getAccount: stores.eosAddress.getAccount,
    getKeyList: stores.eosAddress.getKeyList,
    getAccountList: stores.eosAddress.getAccountList,
    accountInfo: stores.eosAddress.accountInfo,
}))

@observer
class EOSCreateAccountForm extends Component {
    state = {
        ramDefaultValue: 4,
        cpuDefaultValue: 0.15,
        netDefaultValue: 0.05,
        prices: {
            ram: 0,
            cpu: 0,
            net: 0
        }
    }

    componentDidMount() {
        if (this.props.getAccount.length === 0) {
            console.log('No account');
            return;
        }
        wand.request('address_getEOSResourcePrice', { account: this.props.getAccount[0] || DEFAULT_ACCOUNT_NAME }, (err, res) => {
            if (!err) {
                this.setState({
                    prices: res
                });
            } else {
                message.error(intl.get('EOSCreateAccountForm.getResourcePriceFailed'));
            }
        });
    }

    handleOk = () => {
        const { form, getAccount, accountInfo } = this.props;
        form.validateFields(async (err) => {
            if (err) { return; };
            let values = form.getFieldsValue();
            if (getAccount.indexOf(values.name) !== -1) {
                message.error(intl.get('EOSCreateAccountForm.duplicateAccount'));
            }
            if (new BigNumber(values.CPU).plus(values.NET).gt(0)) {
                const balance = this.getBalanceByAccount(values.creator);
                if (!(typeof balance === 'number' && new BigNumber(values.CPU).plus(values.NET).lte(balance))) {
                    message.error(intl.get('EOSAccountList.noSufficientBalance'));
                    return false;
                }
            }
            let params = {
                action: 'newaccount',
                accountName: values.name,
                from: values.creator,
                ownerPublicKey: values.owner,
                activePublicKey: values.active,
                ramBytes: values.RAM,
                cpuAmount: values.CPU,
                netAmount: values.NET,
                BIP44Path: accountInfo[values.creator].path,
                walletID: 1,
            };
            wand.request('transaction_EOSNormal', params, (err, res) => {
                if (!err) {
                    if (res.code) {
                        this.props.handleCancel();
                    } else {
                        message.error(intl.get('EOSCreateAccountForm.createAccountFailed'));
                    }
                } else {
                    console.log(intl.get('EOSCreateAccountForm.createAccountFailed'), err);
                    message.error(intl.get('EOSCreateAccountForm.createAccountFailed'));
                }
            });
        })
    }

    handleCancel = () => {
        this.props.handleCancel();
    }

    getBalanceByAccount = (name) => {
        const { getAccountList } = this.props;
        let index = getAccountList.findIndex((item) => item.account === name);
        return getAccountList[index].balance;
    }

    checkNumber = (rule, value, callback) => {
        if (value >= 0) {
            callback();
        } else {
            callback(intl.get('EOSCreateAccountForm.invalidValue'));
        }
    }

    checkName = (rule, value, callback) => {
        let reg = /^[a-z][1-5a-z\.]{11}$/g;
        if (reg.test(value)) {
            callback();
        } else {
            const str = intl.get('EOSCreateAccountForm.invalidNameFormat');
            callback(str);
        }
    }

    cpuChange = e => {
        this.setState({
            cpuDefaultValue: e.target.value
        });
    }

    netChange = e => {
        this.setState({
            netDefaultValue: e.target.value
        });
    }

    render() {
        const { form, getAccount, getKeyList } = this.props;
        const { ramDefaultValue, cpuDefaultValue, netDefaultValue } = this.state;
        const { getFieldDecorator } = form;
        const span = 8;
        return (
            <div>
                <Modal
                    title={intl.get('EOSCreateAccountForm.createAccount')}
                    visible
                    wrapClassName={style.EOSCreateAccountForm}
                    destroyOnClose={true}
                    closable={false}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" className="cancel" onClick={this.handleCancel}>{intl.get('Common.cancel')}</Button>,
                        <Button key="submit" type="primary" onClick={this.handleOk}>{intl.get('Common.ok')}</Button>,
                    ]}
                >
                    <Form labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} className={style.transForm}>
                        <Form.Item label={intl.get('EOSCreateAccountForm.newAccountName')}>
                            {getFieldDecorator('name', { rules: [{ required: true, validator: this.checkName }] })
                                (<Input placeholder={intl.get('EOSCreateAccountForm.name')} length={12} />)}
                        </Form.Item>
                        <Form.Item label={intl.get('EOSCreateAccountForm.creator')}>
                            {getFieldDecorator('creator', { rules: [{ required: true }] })
                                (
                                    <Select
                                        showSearch
                                        placeholder={intl.get('EOSCreateAccountForm.accountToFundAccount')}
                                        optionFilterProp="children"
                                        filterOption={(input, option) => {
                                            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }}
                                    >
                                        {getAccount.map(v => <Option value={v} key={v}>{v}</Option>)}
                                    </Select>
                                )}
                        </Form.Item>
                        <Form.Item label={intl.get('EOSCreateAccountForm.ownerPublicKey')}>
                            {getFieldDecorator('owner', { rules: [{ required: true }] })
                                (
                                    <Select
                                        showSearch
                                        placeholder={intl.get('EOSCreateAccountForm.ownerKey')}
                                        optionFilterProp="children"
                                        filterOption={(input, option) => {
                                            return option.props.children.props.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }}
                                    >
                                        {getKeyList.map(v => <Option value={v.publicKey} key={v.publicKey}><Tooltip placement="right" title={`${v.name} - ${v.publicKey}`}>{v.name} - {v.publicKey}</Tooltip></Option>)}
                                    </Select>
                                )}
                        </Form.Item>
                        <Form.Item label={intl.get('EOSCreateAccountForm.activePublicKey')}>
                            {getFieldDecorator('active', { rules: [{ required: true }] })
                                (
                                    <Select
                                        showSearch
                                        placeholder={intl.get('EOSCreateAccountForm.activeKey')}
                                        optionFilterProp="children"
                                        filterOption={(input, option) => {
                                            return option.props.children.props.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }}
                                    >
                                        {getKeyList.map(v => <Option value={v.publicKey} key={v.publicKey}><Tooltip placement="right" title={`${v.name} - ${v.publicKey}`}>{v.name} - {v.publicKey}</Tooltip></Option>)}
                                    </Select>
                                )}
                        </Form.Item>
                        <Form.Item label={'RAM'}>
                            {getFieldDecorator('RAM', { initialValue: ramDefaultValue, rules: [{ message: intl.get('EOSCreateAccountForm.atLeast3KB'), validator: this.checkNumber }] })
                                (<Input min={3} addonAfter="KB" />)}
                        </Form.Item>
                        <Form.Item label={`CPU (${new BigNumber(cpuDefaultValue).div(this.state.prices.cpu).toFixed(4).toString()} ms)`}>
                            {getFieldDecorator('CPU', { initialValue: cpuDefaultValue, rules: [{ message: intl.get('EOSCreateAccountForm.invalidValue'), validator: this.checkNumber }] })
                                (<Input min={0} addonAfter="EOS" onChange={this.cpuChange} />)}
                        </Form.Item>
                        <Form.Item label={`NET (${new BigNumber(netDefaultValue).div(this.state.prices.net).toFixed(4).toString()} KB)`}>
                            {getFieldDecorator('NET', { initialValue: netDefaultValue, rules: [{ message: intl.get('EOSCreateAccountForm.invalidValue'), validator: this.checkNumber }] })
                                (<Input min={0} addonAfter="EOS" onChange={this.netChange} />)}
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
}

export default EOSCreateAccountForm;
