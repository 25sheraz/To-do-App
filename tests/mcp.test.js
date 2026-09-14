/**
 * tests/mcp.test.js
 * Unit tests for the To-do Application MCP Server (SHE-11).
 */

const {
  handleRequest,
  TOOLS,
  RESOURCES
} = require('../mcp-server/index.js');

describe('SHE-11: Custom MCP Server for To-do App', () => {

  describe('Protocol Initialization & Health', () => {
    test('handles initialize method and returns server capabilities', () => {
      const response = handleRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2024-11-05' }
      });

      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result.protocolVersion).toBe('2024-11-05');
      expect(response.result.serverInfo.name).toBe('todo-app-mcp-server');
      expect(response.result.capabilities.tools).toBeDefined();
      expect(response.result.capabilities.resources).toBeDefined();
    });

    test('handles ping method', () => {
      const response = handleRequest({
        jsonrpc: '2.0',
        id: 2,
        method: 'ping'
      });
      expect(response.result).toEqual({});
    });

    test('handles notifications/initialized without response', () => {
      const response = handleRequest({
        jsonrpc: '2.0',
        method: 'notifications/initialized'
      });
      expect(response).toBeNull();
    });

    test('returns code -32601 for unknown methods', () => {
      const response = handleRequest({
        jsonrpc: '2.0',
        id: 3,
        method: 'unknown/method'
      });
      expect(response.error).toBeDefined();
      expect(response.error.code).toBe(-32601);
    });
  });

  describe('Tools Management', () => {
    test('tools/list returns available tools with valid schemas', () => {
      const response = handleRequest({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/list'
      });

      expect(response.result.tools).toHaveLength(TOOLS.length);
      const names = response.result.tools.map((t) => t.name);
      expect(names).toContain('get_state_storage_info');
      expect(names).toContain('get_app_architecture');
      expect(names).toContain('query_code');
      expect(names).toContain('list_features');
    });

    test('tool get_state_storage_info answers "where is state stored?" accurately', () => {
      const response = handleRequest({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: { name: 'get_state_storage_info', arguments: {} }
      });

      const text = response.result.content[0].text;
      expect(text).toContain('localStorage');
      expect(text).toContain('"todos"');
      expect(text).toContain('saveTodos');
      expect(text).toContain('loadTodos');
    });

    test('tool get_app_architecture returns stack and public API details', () => {
      const response = handleRequest({
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: { name: 'get_app_architecture', arguments: {} }
      });

      const text = response.result.content[0].text;
      expect(text).toContain('HTML5');
      expect(text).toContain('CSS3');
      expect(text).toContain('JavaScript');
      expect(text).toContain('window.__todoApp');
    });

    test('tool list_features returns all implemented features and ticket IDs', () => {
      const response = handleRequest({
        jsonrpc: '2.0',
        id: 7,
        method: 'tools/call',
        params: { name: 'list_features', arguments: {} }
      });

      const text = response.result.content[0].text;
      expect(text).toContain('SHE-5');
      expect(text).toContain('SHE-6');
      expect(text).toContain('SHE-7');
      expect(text).toContain('SHE-8');
      expect(text).toContain('SHE-9');
      expect(text).toContain('SHE-10');
    });

    test('tool query_code searches and returns function code', () => {
      const response = handleRequest({
        jsonrpc: '2.0',
        id: 8,
        method: 'tools/call',
        params: { name: 'query_code', arguments: { query: 'deleteTodo' } }
      });

      const text = response.result.content[0].text;
      expect(text).toContain('deleteTodo');
      expect(text).toContain('syncEmptyState');
    });

    test('tool query_code responds to state queries with storage info', () => {
      const response = handleRequest({
        jsonrpc: '2.0',
        id: 9,
        method: 'tools/call',
        params: { name: 'query_code', arguments: { query: 'where is state stored?' } }
      });

      const text = response.result.content[0].text;
      expect(text).toContain('localStorage');
    });

    test('tool call returns error for non-existent tool', () => {
      const response = handleRequest({
        jsonrpc: '2.0',
        id: 10,
        method: 'tools/call',
        params: { name: 'non_existent_tool' }
      });

      expect(response.error).toBeDefined();
      expect(response.error.code).toBe(-32601);
    });
  });

  describe('Resources Management', () => {
    test('resources/list returns available resources', () => {
      const response = handleRequest({
        jsonrpc: '2.0',
        id: 11,
        method: 'resources/list'
      });

      expect(response.result.resources).toHaveLength(RESOURCES.length);
      const uris = response.result.resources.map((r) => r.uri);
      expect(uris).toContain('todo://architecture');
      expect(uris).toContain('todo://state-management');
      expect(uris).toContain('todo://source/app.js');
    });

    test('resources/read returns resource content for valid uri', () => {
      const response = handleRequest({
        jsonrpc: '2.0',
        id: 12,
        method: 'resources/read',
        params: { uri: 'todo://state-management' }
      });

      expect(response.result.contents[0].uri).toBe('todo://state-management');
      expect(response.result.contents[0].text).toContain('localStorage');
    });

    test('resources/read returns error for invalid uri', () => {
      const response = handleRequest({
        jsonrpc: '2.0',
        id: 13,
        method: 'resources/read',
        params: { uri: 'todo://unknown' }
      });

      expect(response.error).toBeDefined();
      expect(response.error.code).toBe(-32602);
    });
  });
});
