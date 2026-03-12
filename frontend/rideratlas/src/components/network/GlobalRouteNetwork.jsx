import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { GRAPH } from '@/core/network/networkGraph';

const GlobalRouteNetwork = () => {
  const cyContainer = useRef(null);

  useEffect(() => {
    if (!cyContainer.current) return;

    // 1. Build node and edge lists
    const elements = [];
    const regions = new Set();

    // Create region parent nodes
    Object.values(GRAPH.airports).forEach(airport => {
      if (airport.region && !regions.has(airport.region)) {
        regions.add(airport.region);
        elements.push({
          data: { id: airport.region, label: airport.region },
          classes: 'region',
        });
      }
    });

    // Create airport nodes
    Object.values(GRAPH.airports).forEach(airport => {
      elements.push({
        data: {
          id: airport.code,
          label: airport.code,
          city: airport.city,
          parent: airport.region,
        },
        classes: 'airport',
      });
    });
    
    // Create destination nodes
    Object.values(GRAPH.destinations).forEach(destination => {
        elements.push({
            data: {
                id: destination.slug,
                label: destination.name,
            },
            classes: 'destination',
        });
    });

    // Create route edges
    Object.values(GRAPH.routes).forEach(route => {
      elements.push({
        data: {
          id: route.slug,
          source: route.airport.code,
          target: route.destination.slug,
        },
        classes: 'route',
      });
    });

    const cy = cytoscape({
      container: cyContainer.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#F59E0B',
            'label': 'data(label)',
            'color': '#FFFFFF',
            'font-size': '10px',
            'text-valign': 'center',
            'text-halign': 'center',
          },
        },
        {
            selector: '.airport',
            style: {
              'shape': 'rectangle',
              'background-color': '#0EA5E9',
            }
        },
        {
            selector: '.destination',
            style: {
                'shape': 'ellipse',
                'background-color': '#10B981',
            }
        },
        {
          selector: '.region',
          style: {
            'background-color': '#4B5563',
            'border-color': '#F59E0B',
            'border-width': '1px',
            'content': 'data(label)',
            'text-valign': 'top',
            'text-halign': 'center',
            'color': '#FFFFFF',
            'font-size': '12px',
            'font-weight': 'bold',
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1,
            'line-color': '#6B7280',
            'target-arrow-color': '#6B7280',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
        {
            selector: 'node:hover',
            style: {
              'background-color': '#FFFFFF',
              'border-color': '#F59E0B',
              'border-width': '2px',
            }
        },
      ],
      layout: {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
      },
    });

    // Highlight nodes on hover
    cy.on('mouseover', 'node', (event) => {
        event.target.style({ 'background-color': '#FFFFFF' });
    });
    cy.on('mouseout', 'node', (event) => {
        const node = event.target;
        const nodeType = node.classes().includes('airport') ? 'airport' : (node.classes().includes('destination') ? 'destination' : 'region');
        let color = '#F59E0B'; // default
        if(nodeType === 'airport') color = '#0EA5E9';
        if(nodeType === 'destination') color = '#10B981';
        if(nodeType === 'region') color = '#4B5563';

        node.style({ 'background-color': color });
    });


    return () => {
      cy.destroy();
    };
  }, []);

  return <div ref={cyContainer} style={{ width: '100%', height: '100vh', background: '#111827' }} />;
};

export default GlobalRouteNetwork;
