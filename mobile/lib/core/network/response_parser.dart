class ResponseParser {
  /// Safely extracts a List from diverse API response envelopes:
  /// - Direct List: [ ... ]
  /// - Standard ApiResponse: { "data": [ ... ] }
  /// - PagedDataResult: { "data": { "data": [ ... ], "pagination": { ... } } }
  /// - Alternate Paged: { "data": { "items": [ ... ] } } or { "items": [ ... ] }
  static List<dynamic> extractList(dynamic responseData) {
    if (responseData == null) return [];
    if (responseData is List) return responseData;
    if (responseData is Map) {
      final dataField = responseData['data'];
      if (dataField is List) return dataField;
      if (dataField is Map) {
        if (dataField['data'] is List) return dataField['data'] as List;
        if (dataField['items'] is List) return dataField['items'] as List;
        if (dataField['results'] is List) return dataField['results'] as List;
      }
      final itemsField = responseData['items'];
      if (itemsField is List) return itemsField;
      final resultsField = responseData['results'];
      if (resultsField is List) return resultsField;
    }
    return [];
  }

  /// Safely extracts a Map from diverse API response envelopes
  static Map<String, dynamic> extractMap(dynamic responseData) {
    if (responseData == null) return {};
    if (responseData is Map) {
      final dataField = responseData['data'];
      if (dataField is Map) {
        return Map<String, dynamic>.from(dataField);
      }
      return Map<String, dynamic>.from(responseData);
    }
    return {};
  }
}

