import React from 'react';
import { StockControlFeaturesProps } from '../types';
import StockControlPageContent from './stock/StockControlPageContent';

const StockControlModule: React.FC<StockControlFeaturesProps> = (props) => {
    return <StockControlPageContent {...props} />;
};

export default StockControlModule;
