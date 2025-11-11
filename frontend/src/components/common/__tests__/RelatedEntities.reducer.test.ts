import { describe, it, expect } from 'vitest';
import {
  relatedEntitiesReducer,
  type RelatedEntitiesState,
  type RelatedEntitiesAction,
} from '../RelatedEntities';
import type { Jingle } from '../../../types';

describe('relatedEntitiesReducer', () => {
  const initialState: RelatedEntitiesState = {
    expandedRelationships: new Set(),
    loadedData: {},
    loadingStates: {},
    counts: {},
    inFlightRequests: {},
    errors: {},
  };

  describe('TOGGLE_RELATIONSHIP', () => {
    it('should add relationship key to expandedRelationships when not present', () => {
      const action: RelatedEntitiesAction = {
        type: 'TOGGLE_RELATIONSHIP',
        key: 'jingles-jingle',
      };
      const newState = relatedEntitiesReducer(initialState, action);
      expect(newState.expandedRelationships.has('jingles-jingle')).toBe(true);
    });

    it('should remove relationship key from expandedRelationships when present', () => {
      const stateWithExpanded: RelatedEntitiesState = {
        ...initialState,
        expandedRelationships: new Set(['jingles-jingle']),
      };
      const action: RelatedEntitiesAction = {
        type: 'TOGGLE_RELATIONSHIP',
        key: 'jingles-jingle',
      };
      const newState = relatedEntitiesReducer(stateWithExpanded, action);
      expect(newState.expandedRelationships.has('jingles-jingle')).toBe(false);
    });

    it('should not affect other relationships when toggling', () => {
      const stateWithExpanded: RelatedEntitiesState = {
        ...initialState,
        expandedRelationships: new Set(['autores-artista', 'jingles-jingle']),
      };
      const action: RelatedEntitiesAction = {
        type: 'TOGGLE_RELATIONSHIP',
        key: 'jingles-jingle',
      };
      const newState = relatedEntitiesReducer(stateWithExpanded, action);
      expect(newState.expandedRelationships.has('autores-artista')).toBe(true);
      expect(newState.expandedRelationships.has('jingles-jingle')).toBe(false);
    });
  });

  describe('LOAD_START', () => {
    it('should set loading state to true for the relationship key', () => {
      const abortController = new AbortController();
      const action: RelatedEntitiesAction = {
        type: 'LOAD_START',
        key: 'jingles-jingle',
        abortController,
      };
      const newState = relatedEntitiesReducer(initialState, action);
      expect(newState.loadingStates['jingles-jingle']).toBe(true);
    });

    it('should store AbortController in inFlightRequests', () => {
      const abortController = new AbortController();
      const action: RelatedEntitiesAction = {
        type: 'LOAD_START',
        key: 'jingles-jingle',
        abortController,
      };
      const newState = relatedEntitiesReducer(initialState, action);
      expect(newState.inFlightRequests['jingles-jingle']).toBe(abortController);
    });

    it('should clear any existing error for the relationship key', () => {
      const stateWithError: RelatedEntitiesState = {
        ...initialState,
        errors: {
          'jingles-jingle': new Error('Previous error'),
        },
      };
      const abortController = new AbortController();
      const action: RelatedEntitiesAction = {
        type: 'LOAD_START',
        key: 'jingles-jingle',
        abortController,
      };
      const newState = relatedEntitiesReducer(stateWithError, action);
      expect(newState.errors['jingles-jingle']).toBe(null);
    });
  });

  describe('LOAD_SUCCESS', () => {
    it('should store loaded data and count', () => {
      const jingles: Jingle[] = [
        { id: 'j1', timestamp: '00:01:00', createdAt: '2024-01-01', updatedAt: '2024-01-01', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false },
        { id: 'j2', timestamp: '00:02:00', createdAt: '2024-01-02', updatedAt: '2024-01-02', isJinglazo: false, isJinglazoDelDia: false, isPrecario: false },
      ];
      const abortController = new AbortController();
      const stateWithLoading: RelatedEntitiesState = {
        ...initialState,
        loadingStates: { 'jingles-jingle': true },
        inFlightRequests: { 'jingles-jingle': abortController },
      };
      const action: RelatedEntitiesAction = {
        type: 'LOAD_SUCCESS',
        key: 'jingles-jingle',
        data: jingles,
        count: jingles.length,
      };
      const newState = relatedEntitiesReducer(stateWithLoading, action);
      expect(newState.loadedData['jingles-jingle']).toEqual(jingles);
      expect(newState.counts['jingles-jingle']).toBe(2);
    });

    it('should set loading state to false', () => {
      const abortController = new AbortController();
      const stateWithLoading: RelatedEntitiesState = {
        ...initialState,
        loadingStates: { 'jingles-jingle': true },
        inFlightRequests: { 'jingles-jingle': abortController },
      };
      const action: RelatedEntitiesAction = {
        type: 'LOAD_SUCCESS',
        key: 'jingles-jingle',
        data: [],
        count: 0,
      };
      const newState = relatedEntitiesReducer(stateWithLoading, action);
      expect(newState.loadingStates['jingles-jingle']).toBe(false);
    });

    it('should remove AbortController from inFlightRequests', () => {
      const abortController = new AbortController();
      const stateWithLoading: RelatedEntitiesState = {
        ...initialState,
        loadingStates: { 'jingles-jingle': true },
        inFlightRequests: { 'jingles-jingle': abortController },
      };
      const action: RelatedEntitiesAction = {
        type: 'LOAD_SUCCESS',
        key: 'jingles-jingle',
        data: [],
        count: 0,
      };
      const newState = relatedEntitiesReducer(stateWithLoading, action);
      expect(newState.inFlightRequests['jingles-jingle']).toBeUndefined();
    });

    it('should clear any existing error', () => {
      const abortController = new AbortController();
      const stateWithError: RelatedEntitiesState = {
        ...initialState,
        loadingStates: { 'jingles-jingle': true },
        inFlightRequests: { 'jingles-jingle': abortController },
        errors: { 'jingles-jingle': new Error('Previous error') },
      };
      const action: RelatedEntitiesAction = {
        type: 'LOAD_SUCCESS',
        key: 'jingles-jingle',
        data: [],
        count: 0,
      };
      const newState = relatedEntitiesReducer(stateWithError, action);
      expect(newState.errors['jingles-jingle']).toBe(null);
    });
  });

  describe('LOAD_ERROR', () => {
    it('should store error in errors object', () => {
      const abortController = new AbortController();
      const stateWithLoading: RelatedEntitiesState = {
        ...initialState,
        loadingStates: { 'jingles-jingle': true },
        inFlightRequests: { 'jingles-jingle': abortController },
      };
      const error = new Error('Failed to load');
      const action: RelatedEntitiesAction = {
        type: 'LOAD_ERROR',
        key: 'jingles-jingle',
        error,
      };
      const newState = relatedEntitiesReducer(stateWithLoading, action);
      expect(newState.errors['jingles-jingle']).toBe(error);
    });

    it('should set loading state to false', () => {
      const abortController = new AbortController();
      const stateWithLoading: RelatedEntitiesState = {
        ...initialState,
        loadingStates: { 'jingles-jingle': true },
        inFlightRequests: { 'jingles-jingle': abortController },
      };
      const action: RelatedEntitiesAction = {
        type: 'LOAD_ERROR',
        key: 'jingles-jingle',
        error: new Error('Failed to load'),
      };
      const newState = relatedEntitiesReducer(stateWithLoading, action);
      expect(newState.loadingStates['jingles-jingle']).toBe(false);
    });

    it('should remove AbortController from inFlightRequests', () => {
      const abortController = new AbortController();
      const stateWithLoading: RelatedEntitiesState = {
        ...initialState,
        loadingStates: { 'jingles-jingle': true },
        inFlightRequests: { 'jingles-jingle': abortController },
      };
      const action: RelatedEntitiesAction = {
        type: 'LOAD_ERROR',
        key: 'jingles-jingle',
        error: new Error('Failed to load'),
      };
      const newState = relatedEntitiesReducer(stateWithLoading, action);
      expect(newState.inFlightRequests['jingles-jingle']).toBeUndefined();
    });

    it('should set empty array and zero count on error', () => {
      const abortController = new AbortController();
      const stateWithLoading: RelatedEntitiesState = {
        ...initialState,
        loadingStates: { 'jingles-jingle': true },
        inFlightRequests: { 'jingles-jingle': abortController },
        loadedData: { 'jingles-jingle': [{ id: 'j1' } as Jingle] },
        counts: { 'jingles-jingle': 1 },
      };
      const action: RelatedEntitiesAction = {
        type: 'LOAD_ERROR',
        key: 'jingles-jingle',
        error: new Error('Failed to load'),
      };
      const newState = relatedEntitiesReducer(stateWithLoading, action);
      expect(newState.loadedData['jingles-jingle']).toEqual([]);
      expect(newState.counts['jingles-jingle']).toBe(0);
    });
  });

  describe('CLEAR_IN_FLIGHT', () => {
    it('should remove AbortController from inFlightRequests', () => {
      const abortController = new AbortController();
      const stateWithRequest: RelatedEntitiesState = {
        ...initialState,
        inFlightRequests: { 'jingles-jingle': abortController },
      };
      const action: RelatedEntitiesAction = {
        type: 'CLEAR_IN_FLIGHT',
        key: 'jingles-jingle',
      };
      const newState = relatedEntitiesReducer(stateWithRequest, action);
      expect(newState.inFlightRequests['jingles-jingle']).toBeUndefined();
    });

    it('should not affect other in-flight requests', () => {
      const abortController1 = new AbortController();
      const abortController2 = new AbortController();
      const stateWithRequests: RelatedEntitiesState = {
        ...initialState,
        inFlightRequests: {
          'jingles-jingle': abortController1,
          'autores-artista': abortController2,
        },
      };
      const action: RelatedEntitiesAction = {
        type: 'CLEAR_IN_FLIGHT',
        key: 'jingles-jingle',
      };
      const newState = relatedEntitiesReducer(stateWithRequests, action);
      expect(newState.inFlightRequests['jingles-jingle']).toBeUndefined();
      expect(newState.inFlightRequests['autores-artista']).toBe(abortController2);
    });
  });

  describe('CLEAR_ERROR', () => {
    it('should clear error for the relationship key', () => {
      const stateWithError: RelatedEntitiesState = {
        ...initialState,
        errors: { 'jingles-jingle': new Error('Some error') },
      };
      const action: RelatedEntitiesAction = {
        type: 'CLEAR_ERROR',
        key: 'jingles-jingle',
      };
      const newState = relatedEntitiesReducer(stateWithError, action);
      expect(newState.errors['jingles-jingle']).toBe(null);
    });

    it('should not affect other errors', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      const stateWithErrors: RelatedEntitiesState = {
        ...initialState,
        errors: {
          'jingles-jingle': error1,
          'autores-artista': error2,
        },
      };
      const action: RelatedEntitiesAction = {
        type: 'CLEAR_ERROR',
        key: 'jingles-jingle',
      };
      const newState = relatedEntitiesReducer(stateWithErrors, action);
      expect(newState.errors['jingles-jingle']).toBe(null);
      expect(newState.errors['autores-artista']).toBe(error2);
    });
  });

  describe('default case', () => {
    it('should return state unchanged for unknown action types', () => {
      const action = { type: 'UNKNOWN_ACTION' } as unknown as RelatedEntitiesAction;
      const newState = relatedEntitiesReducer(initialState, action);
      expect(newState).toBe(initialState);
    });
  });
});


