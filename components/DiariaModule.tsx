import React from 'react';
import { DiariaFeaturesProps } from '../types';
import DiariaPageContent from './diaria/DiariaPageContent';

const DiariaModule: React.FC<DiariaFeaturesProps> = (props) => {
    return <DiariaPageContent {...props} />;
};

export default DiariaModule;
