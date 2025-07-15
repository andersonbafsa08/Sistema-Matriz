import React from 'react';
import { CollaboratorFeaturesProps } from '../types';
import CollaboratorsPageContent from './collaborator/CollaboratorsPageContent';

// Note: CollaboratorForm and CollaboratorTableRow are now in their respective files
// within the './collaborator/' directory and imported by CollaboratorsPageContent.

const CollaboratorModule: React.FC<CollaboratorFeaturesProps> = (props) => {
    return <CollaboratorsPageContent {...props} />;
};

export default CollaboratorModule;