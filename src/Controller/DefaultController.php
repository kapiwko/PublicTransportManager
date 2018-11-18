<?php

namespace App\Controller;

use App\Query\GetAllBusStopGroupsQuery;
use App\Query\GetAllBusStopsQuery;
use App\Query\GetAllConnectionsQuery;
use App\Service\DataUploader;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

final class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function index(Request $request): Response
    {
        $data = [];
        return $this->render('default/index.html.twig', $data);
    }

    /**
     * @Route("/downloadData", name="downloadData")
     */
    public function downloadData(
        GetAllBusStopsQuery $getAllBusStops,
        GetAllBusStopGroupsQuery $getAllBusStopGroups,
        GetAllConnectionsQuery $getAllConnections
    ): Response
    {
        $data = [
            [
                'type' => 'busStop',
                'items' => $getAllBusStops(),
            ],
            [
                'type' => 'busStopGroup',
                'items' => $getAllBusStopGroups(),
            ],
            [
                'type' => 'connection',
                'items' => $getAllConnections(),
            ],
        ];
        return new JsonResponse($data);
    }

    /**
     * @Route("/uploadData", name="uploadData")
     */
    public function uploadData(
        Request $request,
        DataUploader $dataUploader,
        GetAllBusStopsQuery $getAllBusStops,
        GetAllBusStopGroupsQuery $getAllBusStopGroups,
        GetAllConnectionsQuery $getAllConnections
    ): Response
    {
        foreach (json_decode($request->getContent(), true) as $data) {
            switch ($data['type']) {
                case 'busStop':
                    $dataUploader->handleBusStopData($getAllBusStops(), $data['items']);
                    break;
                case 'busStopGroup':
                    $dataUploader->handleBusStopGroupData($getAllBusStopGroups(), $data['items']);
                    break;
                case 'connection':
                    $dataUploader->handleConnectionData($getAllConnections(), $data['items']);
                    break;
            }
        }
        $dataUploader->execute();
        return new JsonResponse([]);
    }
}