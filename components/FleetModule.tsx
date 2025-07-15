import React from 'react';
import { FleetFeaturesProps } from '../types';
import FleetPageContent from './fleet/FleetPageContent';

const FleetModule: React.FC<FleetFeaturesProps> = (props) => {
    return <FleetPageContent {...props} />;
};

export default FleetModule;