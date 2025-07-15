
import React from 'react';
import { SettingsFeaturesProps } from '../types';
import SettingsPageContent from './settings/SettingsPageContent';

const SettingsModule: React.FC<SettingsFeaturesProps> = (props) => {
    // This component serves as the entry point for the /settings route.
    return <SettingsPageContent {...props} />;
};

export default SettingsModule;
