import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export function Loader () {
    return (
        <div className="w-100 text-center">
            <Spin indicator={<LoadingOutlined spin />} size="large" />
        </div>
    )
}
