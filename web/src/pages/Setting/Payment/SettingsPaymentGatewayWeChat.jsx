import React, { useEffect, useState, useRef } from 'react';
import {
  Banner,
  Button,
  Form,
  Row,
  Col,
  Spin,
  InputNumber,
} from '@douyinfe/semi-ui';
import { API, removeTrailingSlash, showError, showSuccess } from '../../../helpers';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

export default function SettingsPaymentGatewayWeChat(props) {
  const { t } = useTranslation();
  const sectionTitle = props.hideSectionTitle ? undefined : t('微信支付设置');
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    WeChatPayEnabled: false,
    WeChatPayMchID: '',
    WeChatPayMchCertificateSerialNumber: '',
    WeChatPayAPIv3Key: '',
    WeChatPayPrivateKeyPath: '',
    WeChatPayAppID: '',
    WeChatPayNotifyUrl: '',
    WeChatPayUnitPrice: 7.3,
    WeChatPayMinTopUp: 1,
  });
  const formApiRef = useRef(null);

  useEffect(() => {
    if (props.options && formApiRef.current) {
      const currentInputs = {
        WeChatPayEnabled: props.options.WeChatPayEnabled === 'true',
        WeChatPayMchID: props.options.WeChatPayMchID || '',
        WeChatPayMchCertificateSerialNumber: props.options.WeChatPayMchCertificateSerialNumber || '',
        WeChatPayAPIv3Key: props.options.WeChatPayAPIv3Key || '',
        WeChatPayPrivateKeyPath: props.options.WeChatPayPrivateKeyPath || '',
        WeChatPayAppID: props.options.WeChatPayAppID || '',
        WeChatPayNotifyUrl: props.options.WeChatPayNotifyUrl || '',
        WeChatPayUnitPrice: props.options.WeChatPayUnitPrice !== undefined
          ? parseFloat(props.options.WeChatPayUnitPrice)
          : 7.3,
        WeChatPayMinTopUp: props.options.WeChatPayMinTopUp !== undefined
          ? parseInt(props.options.WeChatPayMinTopUp)
          : 1,
      };
      setInputs(currentInputs);
      formApiRef.current.setValues(currentInputs);
    }
  }, [props.options]);

  const handleFormChange = (values) => {
    setInputs(values);
  };

  const submitWeChatPaySetting = async () => {
    setLoading(true);
    try {
      const options = [
        { key: 'WeChatPayEnabled', value: inputs.WeChatPayEnabled ? 'true' : 'false' },
      ];

      if (inputs.WeChatPayMchID !== undefined && inputs.WeChatPayMchID !== '') {
        options.push({ key: 'WeChatPayMchID', value: inputs.WeChatPayMchID });
      }
      if (inputs.WeChatPayMchCertificateSerialNumber !== undefined && inputs.WeChatPayMchCertificateSerialNumber !== '') {
        options.push({ key: 'WeChatPayMchCertificateSerialNumber', value: inputs.WeChatPayMchCertificateSerialNumber });
      }
      if (inputs.WeChatPayAPIv3Key !== undefined && inputs.WeChatPayAPIv3Key !== '') {
        options.push({ key: 'WeChatPayAPIv3Key', value: inputs.WeChatPayAPIv3Key });
      }
      if (inputs.WeChatPayPrivateKeyPath !== undefined && inputs.WeChatPayPrivateKeyPath !== '') {
        options.push({ key: 'WeChatPayPrivateKeyPath', value: inputs.WeChatPayPrivateKeyPath });
      }
      if (inputs.WeChatPayAppID !== undefined && inputs.WeChatPayAppID !== '') {
        options.push({ key: 'WeChatPayAppID', value: inputs.WeChatPayAppID });
      }
      if (inputs.WeChatPayNotifyUrl !== undefined) {
        options.push({ key: 'WeChatPayNotifyUrl', value: removeTrailingSlash(inputs.WeChatPayNotifyUrl) });
      }
      if (inputs.WeChatPayUnitPrice !== '') {
        options.push({ key: 'WeChatPayUnitPrice', value: inputs.WeChatPayUnitPrice.toString() });
      }
      if (inputs.WeChatPayMinTopUp !== '') {
        options.push({ key: 'WeChatPayMinTopUp', value: inputs.WeChatPayMinTopUp.toString() });
      }

      const requestQueue = options.map((opt) =>
        API.put('/api/option/', {
          key: opt.key,
          value: opt.value,
        }),
      );

      const results = await Promise.all(requestQueue);
      const errorResults = results.filter((res) => !res.data.success);
      if (errorResults.length > 0) {
        errorResults.forEach((res) => {
          showError(res.data.message);
        });
      } else {
        showSuccess(t('更新成功'));
        props.refresh && props.refresh();
      }
    } catch (error) {
      showError(t('更新失败'));
    }
    setLoading(false);
  };

  return (
    <Spin spinning={loading}>
      <Form
        initValues={inputs}
        onValueChange={handleFormChange}
        getFormApi={(api) => (formApiRef.current = api)}
      >
        <Form.Section text={sectionTitle}>
          <Banner
            type='info'
            icon={<Info size={16} />}
            description={t(
              '微信支付 V3 Native 支付，用户扫码完成付款。回调地址请在下方配置，或留空使用服务器地址自动生成。',
            )}
            style={{ marginBottom: 16 }}
          />
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Switch
                field='WeChatPayEnabled'
                label={t('启用微信支付')}
                extraText={t('开启后用户可在充值时选择微信支付')}
              />
            </Col>
          </Row>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='WeChatPayMchID'
                label={t('商户号 (MchID)')}
                placeholder={t('例如：1234567890')}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='WeChatPayMchCertificateSerialNumber'
                label={t('商户证书序列号')}
                placeholder={t('例如：5F2A0E...')}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='WeChatPayAppID'
                label={t('应用ID (AppID)')}
                placeholder={t('例如：wx1234567890abcdef')}
              />
            </Col>
          </Row>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='WeChatPayAPIv3Key'
                label={t('APIv3 密钥')}
                placeholder={t('32位随机字符串，敏感信息不显示')}
                type='password'
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='WeChatPayPrivateKeyPath'
                label={t('商户私钥文件路径')}
                placeholder={t('例如：/certs/apiclient_key.pem')}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.Input
                field='WeChatPayNotifyUrl'
                label={t('回调通知地址')}
                placeholder={t('留空则自动生成：{服务器地址}/api/wechatpay/webhook')}
              />
            </Col>
          </Row>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24, xl: 24, xxl: 24 }}>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.InputNumber
                field='WeChatPayUnitPrice'
                label={t('单价（元）')}
                placeholder={t('每额度对应的人民币金额')}
                min={0.01}
                precision={2}
                defaultValue={7.3}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Form.InputNumber
                field='WeChatPayMinTopUp'
                label={t('最低充值数量')}
                placeholder={t('最低充值额度数量')}
                min={1}
                precision={0}
                defaultValue={1}
              />
            </Col>
          </Row>
          <Button onClick={submitWeChatPaySetting} style={{ marginTop: 16 }}>
            {t('更新微信支付设置')}
          </Button>
        </Form.Section>
      </Form>
    </Spin>
  );
}
