'use client';

import { useState, useCallback } from 'react';
import {
  fetchUnassignedFieldOperators,
  assignFieldOperator,
  replaceFieldOperator,
  unassignFieldOperator,
} from '@/lib/api/sites';
import { FieldOperator } from '@/types/site-detail';

export function useSiteOperator(
  siteId: number,
  operator: FieldOperator | null,
  onOperatorChange: () => void,
) {
  const [unassignedOperators, setUnassignedOperators] = useState<FieldOperator[]>([]);
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);

  const [assigning, setAssigning]     = useState(false);
  const [replacing, setReplacing]     = useState(false);
  const [unassigning, setUnassigning] = useState(false);

  const loadUnassignedOperators = useCallback(() => {
    setLoadingUnassigned(true);
    fetchUnassignedFieldOperators()
      .then(setUnassignedOperators)
      .catch(() => setUnassignedOperators([]))
      .finally(() => setLoadingUnassigned(false));
  }, []);

  const assignOperator = useCallback(async (operatorId: number) => {
    setAssigning(true);
    try {
      await assignFieldOperator(siteId, operatorId);
      onOperatorChange();
    } finally {
      setAssigning(false);
    }
  }, [siteId, onOperatorChange]);

  const replaceOperatorAction = useCallback(async (operatorId: number) => {
    setReplacing(true);
    try {
      await replaceFieldOperator(siteId, operatorId);
      onOperatorChange();
    } finally {
      setReplacing(false);
    }
  }, [siteId, onOperatorChange]);

  const unassignOperatorAction = useCallback(async () => {
    setUnassigning(true);
    try {
      await unassignFieldOperator(siteId);
      onOperatorChange();
    } finally {
      setUnassigning(false);
    }
  }, [siteId, onOperatorChange]);

  return {
    operator,
    unassignedOperators, loadingUnassigned, loadUnassignedOperators,
    assigning, assignOperator,
    replacing, replaceOperatorAction,
    unassigning, unassignOperatorAction,
  };
}